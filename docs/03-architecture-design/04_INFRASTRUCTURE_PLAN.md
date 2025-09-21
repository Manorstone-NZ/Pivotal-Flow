# Pivotal Flow - Infrastructure & Deployment Plan

## 🏗️ **Infrastructure Overview**

### **Architecture Principles**
1. **Cloud-Native**: Leverage cloud services for scalability and reliability
2. **Infrastructure as Code**: All infrastructure defined in code for reproducibility
3. **Multi-Environment**: Development, staging, and production environments
4. **Security First**: Zero-trust security model with defense in depth
5. **Observability**: Comprehensive monitoring, logging, and alerting
6. **Disaster Recovery**: Multi-region deployment with automated failover
7. **Cost Optimization**: Right-sizing and auto-scaling for cost efficiency

### **Target Infrastructure**
- **Primary Cloud**: AWS (with multi-region deployment)
- **Container Orchestration**: Kubernetes with Istio service mesh
- **Database**: Amazon RDS for PostgreSQL with read replicas
- **Caching**: Amazon ElastiCache for Redis
- **Message Queue**: Amazon SQS with SNS for notifications
- **Storage**: Amazon S3 for file storage and backups
- **CDN**: Amazon CloudFront for global content delivery

---

## ☁️ **Cloud Architecture**

### **AWS Services Mapping**

#### **1. Compute & Container Services**
```yaml
# EKS Cluster Configuration
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig
metadata:
  name: pivotal-flow-cluster
  region: us-west-2
  version: '1.28'

nodeGroups:
  - name: system-nodes
    instanceType: m5.large
    desiredCapacity: 3
    minSize: 2
    maxSize: 5
    volumeSize: 100
    labels:
      role: system
      nodegroup: system
    
  - name: application-nodes
    instanceType: c5.2xlarge
    desiredCapacity: 5
    minSize: 3
    maxSize: 10
    volumeSize: 200
    labels:
      role: application
      nodegroup: application
    
  - name: database-nodes
    instanceType: r5.2xlarge
    desiredCapacity: 3
    minSize: 2
    maxSize: 5
    volumeSize: 500
    labels:
      role: database
      nodegroup: database

# Auto Scaling Configuration
autoScalingGroups:
  - name: application-asg
    minSize: 3
    maxSize: 10
    desiredCapacity: 5
    targetGroupARNs:
      - arn:aws:elasticloadbalancing:us-west-2:123456789012:targetgroup/pivotal-flow-tg/1234567890123456
    mixedInstancesPolicy:
      instancesDistribution:
        onDemandPercentageAboveBaseCapacity: 25
        onDemandBaseCapacity: 2
        spotAllocationStrategy: capacity-optimized
      launchTemplate:
        launchTemplateSpecification:
          launchTemplateId: lt-12345678901234567
          version: $Latest
        overrides:
          - instanceType: c5.2xlarge
            weightedCapacity: 1
          - instanceType: c5.4xlarge
            weightedCapacity: 2
          - instanceType: c5.9xlarge
            weightedCapacity: 4
```

#### **2. Database & Storage Services**
```yaml
# RDS PostgreSQL Configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: database-config
  namespace: pivotal-flow
data:
  DB_HOST: pivotal-flow-db.cluster-123456789012.us-west-2.rds.amazonaws.com
  DB_PORT: "5432"
  DB_NAME: pivotalflow
  DB_USERNAME: pivotal_admin
  DB_SSL_MODE: require
  DB_POOL_MIN: "5"
  DB_POOL_MAX: "20"
  DB_POOL_IDLE_TIMEOUT: "30000"
  DB_POOL_ACQUIRE_TIMEOUT: "60000"

# S3 Bucket Configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: storage-config
  namespace: pivotal-flow
data:
  S3_BUCKET: pivotal-flow-storage-123456789012
  S3_REGION: us-west-2
  S3_ENCRYPTION: AES256
  S3_VERSIONING: enabled
  S3_LIFECYCLE_RULES: |
    - id: transition-to-ia
      status: enabled
      transitions:
        - days: 30
          storageClass: STANDARD_IA
        - days: 90
          storageClass: GLACIER
        - days: 365
          storageClass: DEEP_ARCHIVE
      noncurrentVersionTransitions:
        - noncurrentDays: 7
          storageClass: STANDARD_IA
        - noncurrentDays: 30
          storageClass: GLACIER
      noncurrentVersionExpiration:
        noncurrentDays: 90
```

#### **3. Networking & Security Services**
```yaml
# VPC Configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: network-config
  namespace: pivotal-flow
data:
  VPC_ID: vpc-12345678901234567
  VPC_CIDR: 10.0.0.0/16
  PUBLIC_SUBNETS: |
    - subnet-12345678901234567
    - subnet-23456789012345678
    - subnet-34567890123456789
  PRIVATE_SUBNETS: |
    - subnet-45678901234567890
    - subnet-56789012345678901
    - subnet-67890123456789012
  NAT_GATEWAYS: |
    - nat-12345678901234567
    - nat-23456789012345678
    - nat-34567890123456789

# Security Group Rules
apiVersion: v1
kind: ConfigMap
metadata:
  name: security-config
  namespace: pivotal-flow
data:
  ALB_SECURITY_GROUP: sg-12345678901234567
  EKS_SECURITY_GROUP: sg-23456789012345678
  RDS_SECURITY_GROUP: sg-34567890123456789
  REDIS_SECURITY_GROUP: sg-45678901234567890
  SQS_SECURITY_GROUP: sg-56789012345678901
```

---

## 🐳 **Container Orchestration**

### **Kubernetes Configuration**

#### **1. Namespace Structure**
```yaml
# Namespace Definition
apiVersion: v1
kind: Namespace
metadata:
  name: pivotal-flow
  labels:
    name: pivotal-flow
    environment: production
    team: engineering
    cost-center: pivotal-flow

---
# Resource Quotas
apiVersion: v1
kind: ResourceQuota
metadata:
  name: pivotal-flow-quota
  namespace: pivotal-flow
spec:
  hard:
    requests.cpu: "20"
    requests.memory: 40Gi
    limits.cpu: "40"
    limits.memory: 80Gi
    requests.storage: 100Gi
    persistentvolumeclaims: "20"
    services: "50"
    services.loadbalancers: "5"
    services.nodeports: "10"
    secrets: "50"
    configmaps: "50"
    pods: "100"
    replicationcontrollers: "20"
    resourcequotas: "1"
    services.loadbalancers: "5"

---
# Limit Ranges
apiVersion: v1
kind: LimitRange
metadata:
  name: pivotal-flow-limits
  namespace: pivotal-flow
spec:
  limits:
    - type: Pod
      max:
        cpu: "4"
        memory: 8Gi
      min:
        cpu: 100m
        memory: 128Mi
    - type: Container
      max:
        cpu: "2"
        memory: 4Gi
      min:
        cpu: 50m
        memory: 64Mi
      default:
        cpu: 500m
        memory: 1Gi
      defaultRequest:
        cpu: 250m
        memory: 512Mi
```

#### **2. Service Mesh Configuration**
```yaml
# Istio Installation
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-control-plane
spec:
  profile: production
  components:
    pilot:
      k8s:
        resources:
          requests:
            cpu: 500m
            memory: 2048Mi
          limits:
            cpu: 1000m
            memory: 4096Mi
        hpaSpec:
          maxReplicas: 5
          minReplicas: 2
        env:
          - name: PILOT_CERT_PROVIDER
            value: istiod
          - name: PILOT_JWT_POLICY
            value: third-party-jwt
          - name: PILOT_PUSH_THROTTLE
            value: "100"
    
    ingressGateways:
      - name: istio-ingressgateway
        enabled: true
        k8s:
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 2000m
              memory: 1024Mi
          hpaSpec:
            maxReplicas: 5
            minReplicas: 2
          service:
            ports:
              - name: http2
                port: 80
                targetPort: 8080
              - name: https
                port: 443
                targetPort: 8443
              - name: tcp
                port: 31400
                targetPort: 31400
              - name: tls
                port: 15443
                targetPort: 15443

---
# Virtual Service Configuration
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: pivotal-flow-vs
  namespace: pivotal-flow
spec:
  hosts:
    - "api.pivotalflow.com"
    - "app.pivotalflow.com"
  gateways:
    - pivotal-flow-gateway
  http:
    - match:
        - uri:
            prefix: "/api/v1"
        - uri:
            prefix: "/api/v2"
      route:
        - destination:
            host: pivotal-flow-backend
            port:
              number: 3002
            subset: v1
          weight: 90
        - destination:
            host: pivotal-flow-backend
            port:
              number: 3002
            subset: v2
          weight: 10
      retries:
        attempts: 3
        perTryTimeout: 2s
      fault:
        delay:
          percentage:
            value: 5
          fixedDelay: 2s
        abort:
          percentage:
            value: 1
          httpStatus: 500
```

---

## 🔒 **Security Architecture**

### **Network Security**

#### **1. VPC Design**
```yaml
# VPC Configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: vpc-config
  namespace: pivotal-flow
data:
  VPC_CONFIG: |
    VPC:
      CidrBlock: 10.0.0.0/16
      EnableDnsHostnames: true
      EnableDnsSupport: true
      Tags:
        - Key: Name
          Value: PivotalFlow-VPC
        - Key: Environment
          Value: Production
        - Key: Project
          Value: PivotalFlow
    
    Subnets:
      Public:
        - AvailabilityZone: us-west-2a
          CidrBlock: 10.0.1.0/24
          Name: PivotalFlow-Public-1a
        - AvailabilityZone: us-west-2b
          CidrBlock: 10.0.2.0/24
          Name: PivotalFlow-Public-1b
        - AvailabilityZone: us-west-2c
          CidrBlock: 10.0.3.0/24
          Name: PivotalFlow-Public-1c
      
      Private:
        - AvailabilityZone: us-west-2a
          CidrBlock: 10.0.10.0/24
          Name: PivotalFlow-Private-1a
        - AvailabilityZone: us-west-2b
          CidrBlock: 10.0.11.0/24
          Name: PivotalFlow-Private-1b
        - AvailabilityZone: us-west-2c
          CidrBlock: 10.0.12.0/24
          Name: PivotalFlow-Private-1c
      
      Database:
        - AvailabilityZone: us-west-2a
          CidrBlock: 10.0.20.0/24
          Name: PivotalFlow-Database-1a
        - AvailabilityZone: us-west-2b
          CidrBlock: 10.0.21.0/24
          Name: PivotalFlow-Database-1b
        - AvailabilityZone: us-west-2c
          CidrBlock: 10.0.22.0/24
          Name: PivotalFlow-Database-1c

---
# Security Groups
apiVersion: v1
kind: ConfigMap
metadata:
  name: security-groups
  namespace: pivotal-flow
data:
  ALB_SECURITY_GROUP: |
    GroupName: PivotalFlow-ALB-SG
    Description: Security group for Application Load Balancer
    Rules:
      Inbound:
        - Protocol: tcp
          Port: 80
          Source: 0.0.0.0/0
          Description: HTTP access
        - Protocol: tcp
          Port: 443
          Source: 0.0.0.0/0
          Description: HTTPS access
      Outbound:
        - Protocol: all
          Port: -1
          Source: 0.0.0.0/0
          Description: All outbound traffic
    
  EKS_SECURITY_GROUP: |
    GroupName: PivotalFlow-EKS-SG
    Description: Security group for EKS cluster
    Rules:
      Inbound:
        - Protocol: tcp
          Port: 443
          Source: ALB-SG
          Description: HTTPS from ALB
        - Protocol: tcp
          Port: 3000-3010
          Source: ALB-SG
          Description: Application ports from ALB
      Outbound:
        - Protocol: all
          Port: -1
          Source: 0.0.0.0/0
          Description: All outbound traffic
    
  RDS_SECURITY_GROUP: |
    GroupName: PivotalFlow-RDS-SG
    Description: Security group for RDS database
    Rules:
      Inbound:
        - Protocol: tcp
          Port: 5432
          Source: EKS-SG
          Description: PostgreSQL access from EKS
      Outbound:
        - Protocol: all
          Port: -1
          Source: 0.0.0.0/0
          Description: All outbound traffic
```

#### **2. Encryption & Key Management**
```yaml
# KMS Configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: kms-config
  namespace: pivotal-flow
data:
  KMS_KEYS: |
    - KeyId: alias/pivotal-flow-app-key
      Description: Application encryption key
      Usage: ENCRYPT_DECRYPT
      KeySpec: SYMMETRIC_DEFAULT
      Origin: AWS_KMS
      MultiRegion: true
      Tags:
        - Key: Environment
          Value: Production
        - Key: Application
          Value: PivotalFlow
    
    - KeyId: alias/pivotal-flow-db-key
      Description: Database encryption key
      Usage: ENCRYPT_DECRYPT
      KeySpec: SYMMETRIC_DEFAULT
      Origin: AWS_KMS
      MultiRegion: true
      Tags:
        - Key: Environment
          Value: Production
        - Key: Application
          Value: PivotalFlow
    
    - KeyId: alias/pivotal-flow-backup-key
      Description: Backup encryption key
      Usage: ENCRYPT_DECRYPT
      KeySpec: SYMMETRIC_DEFAULT
      Origin: AWS_KMS
      MultiRegion: true
      Tags:
        - Key: Environment
          Value: Production
        - Key: Application
          Value: PivotalFlow

---
# Encryption Configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: encryption-config
  namespace: pivotal-flow
data:
  ENCRYPTION_SETTINGS: |
    Database:
      StorageEncrypted: true
      KmsKeyId: alias/pivotal-flow-db-key
      BackupEncrypted: true
      BackupKmsKeyId: alias/pivotal-flow-backup-key
    
    S3:
      ServerSideEncryption: AES256
      KmsKeyId: alias/pivotal-flow-app-key
      Versioning: enabled
      MfaDelete: enabled
    
    EBS:
      Encrypted: true
      KmsKeyId: alias/pivotal-flow-app-key
    
    EFS:
      Encrypted: true
      KmsKeyId: alias/pivotal-flow-app-key
```

---

## 📊 **Monitoring & Observability**

### **Monitoring Stack**

#### **1. Prometheus Configuration**
```yaml
# Prometheus Server Configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
      external_labels:
        cluster: pivotal-flow-cluster
        environment: production
    
    rule_files:
      - /etc/prometheus/rules/*.yml
    
    scrape_configs:
      - job_name: 'kubernetes-apiservers'
        kubernetes_sd_configs:
          - role: endpoints
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
          insecure_skip_verify: true
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
        relabel_configs:
          - source_labels: [__meta_kubernetes_namespace, __meta_kubernetes_service_name, __meta_kubernetes_endpoint_port_name]
            action: keep
            regex: default;kubernetes;https
      
      - job_name: 'kubernetes-nodes'
        kubernetes_sd_configs:
          - role: node
        scheme: https
        tls_config:
          ca_file: /var/run/secrets/kubernetes.io/serviceaccount/ca.crt
          insecure_skip_verify: true
        bearer_token_file: /var/run/secrets/kubernetes.io/serviceaccount/token
        relabel_configs:
          - action: labelmap
            regex: __meta_kubernetes_node_label_(.+)
      
      - job_name: 'kubernetes-pods'
        kubernetes_sd_configs:
          - role: pod
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: true
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
            action: replace
            target_label: __metrics_path__
            regex: (.+)
          - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
            action: replace
            regex: ([^:]+)(?::\d+)?;(\d+)
            replacement: $1:$2
            target_label: __address__
          - action: labelmap
            regex: __meta_kubernetes_pod_label_(.+)
          - source_labels: [__meta_kubernetes_namespace]
            action: replace
            target_label: kubernetes_namespace
          - source_labels: [__meta_kubernetes_pod_name]
            action: replace
            target_label: kubernetes_pod_name
      
      - job_name: 'pivotal-flow-backend'
        static_configs:
          - targets: ['pivotal-flow-backend:3002']
        metrics_path: /metrics
        scrape_interval: 30s
      
      - job_name: 'pivotal-flow-frontend'
        static_configs:
          - targets: ['pivotal-flow-frontend:3000']
        metrics_path: /metrics
        scrape_interval: 30s

---
# Alerting Rules
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-rules
  namespace: monitoring
data:
  pivotal-flow-rules.yml: |
    groups:
      - name: pivotal-flow
        rules:
          - alert: HighCPUUsage
            expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
            for: 5m
            labels:
              severity: warning
            annotations:
              summary: "High CPU usage on {{ $labels.instance }}"
              description: "CPU usage is above 80% for more than 5 minutes"
          
          - alert: HighMemoryUsage
            expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
            for: 5m
            labels:
              severity: warning
            annotations:
              summary: "High memory usage on {{ $labels.instance }}"
              description: "Memory usage is above 85% for more than 5 minutes"
          
          - alert: HighDiskUsage
            expr: (node_filesystem_size_bytes - node_filesystem_free_bytes) / node_filesystem_size_bytes * 100 > 85
            for: 5m
            labels:
              severity: warning
            annotations:
              summary: "High disk usage on {{ $labels.instance }}"
              description: "Disk usage is above 85% for more than 5 minutes"
          
          - alert: PodRestartingFrequently
            expr: increase(kube_pod_container_status_restarts_total[1h]) > 5
            for: 10m
            labels:
              severity: warning
            annotations:
              summary: "Pod {{ $labels.pod }} is restarting frequently"
              description: "Pod has restarted more than 5 times in the last hour"
          
          - alert: ServiceDown
            expr: up == 0
            for: 1m
            labels:
              severity: critical
            annotations:
              summary: "Service {{ $labels.job }} is down"
              description: "Service {{ $labels.job }} has been down for more than 1 minute"
```

#### **2. Grafana Dashboard Configuration**
```yaml
# Grafana Dashboard
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-dashboards
  namespace: monitoring
data:
  pivotal-flow-overview.json: |
    {
      "dashboard": {
        "id": null,
        "title": "Pivotal Flow - System Overview",
        "tags": ["pivotal-flow", "overview"],
        "style": "dark",
        "timezone": "browser",
        "panels": [
          {
            "id": 1,
            "title": "CPU Usage",
            "type": "graph",
            "targets": [
              {
                "expr": "100 - (avg by(instance) (irate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
                "legendFormat": "{{instance}}"
              }
            ],
            "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0}
          },
          {
            "id": 2,
            "title": "Memory Usage",
            "type": "graph",
            "targets": [
              {
                "expr": "(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100",
                "legendFormat": "{{instance}}"
              }
            ],
            "gridPos": {"h": 8, "w": 12, "x": 12, "y": 0}
          },
          {
            "id": 3,
            "title": "HTTP Request Rate",
            "type": "graph",
            "targets": [
              {
                "expr": "rate(http_requests_total[5m])",
                "legendFormat": "{{method}} {{endpoint}}"
              }
            ],
            "gridPos": {"h": 8, "w": 12, "x": 0, "y": 8}
          },
          {
            "id": 4,
            "title": "Response Time",
            "type": "graph",
            "targets": [
              {
                "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
                "legendFormat": "95th percentile"
              }
            ],
            "gridPos": {"h": 8, "w": 12, "x": 12, "y": 8}
          }
        ],
        "time": {
          "from": "now-1h",
          "to": "now"
        },
        "refresh": "30s"
      }
    }
```

---

## 🚀 **Deployment Pipeline**

### **CI/CD Configuration**

#### **1. GitHub Actions Workflow**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  AWS_REGION: us-west-2
  EKS_CLUSTER_NAME: pivotal-flow-cluster
  ECR_REGISTRY: 123456789012.dkr.ecr.us-west-2.amazonaws.com
  IMAGE_TAG: ${{ github.sha }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          npm ci
          cd apps/pivotalflow/backend && npm ci
          cd ../frontend && npm ci
      
      - name: Run tests
        run: |
          npm run test
          cd apps/pivotalflow/backend && npm run test
          cd ../frontend && npm run test
      
      - name: Run linting
        run: |
          npm run lint
          cd apps/pivotalflow/backend && npm run lint
          cd ../frontend && npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push backend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        run: |
          docker build -t $ECR_REGISTRY/pivotal-flow-backend:$IMAGE_TAG ./apps/pivotalflow/backend
          docker push $ECR_REGISTRY/pivotal-flow-backend:$IMAGE_TAG
      
      - name: Build and push frontend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        run: |
          docker build -t $ECR_REGISTRY/pivotal-flow-frontend:$IMAGE_TAG ./apps/pivotalflow/frontend
          docker push $ECR_REGISTRY/pivotal-flow-frontend:$IMAGE_TAG

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Update kubeconfig
        run: aws eks update-kubeconfig --name ${{ env.EKS_CLUSTER_NAME }} --region ${{ env.AWS_REGION }}
      
      - name: Deploy to Kubernetes
        run: |
          # Update image tags in deployment files
          sed -i "s|IMAGE_TAG|${{ env.IMAGE_TAG }}|g" k8s/deployments/*.yml
          
          # Apply deployments
          kubectl apply -f k8s/namespace.yml
          kubectl apply -f k8s/configmaps/
          kubectl apply -f k8s/secrets/
          kubectl apply -f k8s/deployments/
          kubectl apply -f k8s/services/
          kubectl apply -f k8s/ingress/
      
      - name: Wait for deployment
        run: |
          kubectl rollout status deployment/pivotal-flow-backend -n pivotal-flow --timeout=300s
          kubectl rollout status deployment/pivotal-flow-frontend -n pivotal-flow --timeout=300s
      
      - name: Run smoke tests
        run: |
          # Wait for services to be ready
          kubectl wait --for=condition=ready pod -l app=pivotal-flow-backend -n pivotal-flow --timeout=300s
          kubectl wait --for=condition=ready pod -l app=pivotal-flow-frontend -n pivotal-flow --timeout=300s
          
          # Run basic health checks
          kubectl run smoke-test --rm -i --restart=Never --image=curlimages/curl -- curl -f http://pivotal-flow-backend:3002/health
          kubectl run smoke-test --rm -i --restart=Never --image=curlimages/curl -- curl -f http://pivotal-flow-frontend:3000/health

  rollback:
    needs: deploy
    runs-on: ubuntu-latest
    if: failure()
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Update kubeconfig
        run: aws eks update-kubeconfig --name ${{ env.EKS_CLUSTER_NAME }} --region ${{ env.AWS_REGION }}
      
      - name: Rollback deployment
        run: |
          kubectl rollout undo deployment/pivotal-flow-backend -n pivotal-flow
          kubectl rollout undo deployment/pivotal-flow-frontend -n pivotal-flow
```

#### **2. Kubernetes Deployment Manifests**
```yaml
# k8s/deployments/backend.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pivotal-flow-backend
  namespace: pivotal-flow
  labels:
    app: pivotal-flow-backend
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pivotal-flow-backend
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: pivotal-flow-backend
        version: v1
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3002"
        prometheus.io/path: "/metrics"
    spec:
      containers:
        - name: pivotal-flow-backend
          image: 123456789012.dkr.ecr.us-west-2.amazonaws.com/pivotal-flow-backend:IMAGE_TAG
          ports:
            - containerPort: 3002
              name: http
          env:
            - name: NODE_ENV
              value: "production"
            - name: PORT
              value: "3002"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: database-secrets
                  key: database-url
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: redis-secrets
                  key: redis-url
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: jwt-secrets
                  key: jwt-secret
          resources:
            requests:
              cpu: 250m
              memory: 512Mi
            limits:
              cpu: 1000m
              memory: 2Gi
          livenessProbe:
            httpGet:
              path: /health
              port: 3002
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: 3002
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
          securityContext:
            runAsNonRoot: true
            runAsUser: 1000
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
      imagePullSecrets:
        - name: ecr-registry-secret
      securityContext:
        fsGroup: 1000
```

---

## 🔄 **Disaster Recovery**

### **Multi-Region Deployment**

#### **1. Primary Region Configuration**
```yaml
# Primary Region (us-west-2)
apiVersion: v1
kind: ConfigMap
metadata:
  name: primary-region-config
  namespace: pivotal-flow
data:
  REGION: us-west-2
  AVAILABILITY_ZONES: |
    - us-west-2a
    - us-west-2b
    - us-west-2c
  VPC_CIDR: 10.0.0.0/16
  DATABASE_MULTI_AZ: true
  REDIS_MULTI_AZ: true
  BACKUP_RETENTION: 30
  CROSS_REGION_BACKUP: true
  BACKUP_DESTINATION_REGION: us-east-1

---
# Secondary Region (us-east-1)
apiVersion: v1
kind: ConfigMap
metadata:
  name: secondary-region-config
  namespace: pivotal-flow
data:
  REGION: us-east-1
  AVAILABILITY_ZONES: |
    - us-east-1a
    - us-east-1b
    - us-east-1c
  VPC_CIDR: 10.1.0.0/16
  DATABASE_MULTI_AZ: true
  REDIS_MULTI_AZ: true
  BACKUP_RETENTION: 7
  CROSS_REGION_BACKUP: false
  BACKUP_DESTINATION_REGION: us-west-2
```

#### **2. Failover Configuration**
```yaml
# Route 53 Failover Configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: route53-failover-config
  namespace: pivotal-flow
data:
  PRIMARY_HEALTH_CHECK: |
    HealthCheckId: hc-12345678901234567
    IPAddress: 10.0.1.100
    Port: 80
    Type: HTTP
    ResourcePath: /health
    RequestInterval: 30
    FailureThreshold: 3
    HealthThreshold: 3
  
  SECONDARY_HEALTH_CHECK: |
    HealthCheckId: hc-23456789012345678
    IPAddress: 10.1.1.100
    Port: 80
    Type: HTTP
    ResourcePath: /health
    RequestInterval: 30
    FailureThreshold: 3
    HealthThreshold: 3
  
  FAILOVER_CONFIG: |
    PrimaryRecordSet:
      Name: api.pivotalflow.com
      Type: A
      TTL: 300
      HealthCheckId: hc-12345678901234567
      Failover: PRIMARY
    
    SecondaryRecordSet:
      Name: api.pivotalflow.com
      Type: A
      TTL: 300
      HealthCheckId: hc-23456789012345678
      Failover: SECONDARY
```

---

## 📋 **Implementation Checklist**

### **Phase 1: Infrastructure Setup**
- [ ] Create VPC with public/private subnets
- [ ] Set up EKS cluster with node groups
- [ ] Configure RDS PostgreSQL with read replicas
- [ ] Set up ElastiCache Redis cluster
- [ ] Configure S3 buckets with lifecycle policies
- [ ] Set up CloudWatch monitoring and alerting

### **Phase 2: Security Implementation**
- [ ] Configure security groups and NACLs
- [ ] Set up KMS encryption keys
- [ ] Implement IAM roles and policies
- [ ] Configure VPC endpoints for AWS services
- [ ] Set up WAF and Shield for DDoS protection

### **Phase 3: Monitoring & Observability**
- [ ] Deploy Prometheus and Grafana
- [ ] Configure custom metrics collection
- [ ] Set up alerting rules and notifications
- [ ] Implement distributed tracing with Jaeger
- [ ] Configure log aggregation with ELK stack

### **Phase 4: CI/CD Pipeline**
- [ ] Set up GitHub Actions workflows
- [ ] Configure ECR repositories
- [ ] Create Kubernetes deployment manifests
- [ ] Implement automated testing and validation
- [ ] Set up rollback procedures

### **Phase 5: Disaster Recovery**
- [ ] Deploy to secondary region
- [ ] Configure cross-region backups
- [ ] Set up Route 53 failover
- [ ] Test failover procedures
- [ ] Document recovery runbooks

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Next Review**: February 2025  
**Infrastructure Version**: 1.0.0
