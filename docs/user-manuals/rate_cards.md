# F2 Rate Cards User Manual

## Overview

Rate Cards are a powerful feature in Pivotal Flow that allows you to organize and manage your service pricing. This F2 implementation focuses on services-only rate cards, providing a streamlined way to define your service offerings with consistent buy and sell pricing.

## Key Features

- **Service-Only Pricing**: Create rate cards containing individual services (bundles will be available in future releases)
- **Multi-Currency Support**: Support for NZD, USD, AUD, EUR, and GBP
- **Flexible Unit of Measure**: Price services by hour, day, or fixed amount
- **Buy/Sell Pricing**: Track both cost (buy price) and revenue (sell price) for accurate margin calculation
- **Tax Classification**: Assign appropriate tax classes (Standard, Reduced, Zero, Exempt)
- **Multi-Tenant Security**: Complete isolation between organizations with row-level security

## Getting Started

### Accessing Rate Cards

1. Navigate to the main menu in Pivotal Flow
2. Click on **"Rate Cards"** in the navigation menu
3. You'll see the Rate Cards list page with all your existing rate cards

### Creating Your First Rate Card

1. On the Rate Cards list page, click the **"Create Rate Card"** button
2. Fill in the required information:
   - **Name**: Give your rate card a descriptive name (e.g., "Software Development Services 2024")
   - **Description**: Provide additional context about this rate card
   - **Currency**: Select your primary currency (NZD, USD, AUD, EUR, or GBP)
3. Click **"Create Rate Card"** to save

## Managing Rate Cards

### Viewing Rate Cards

The Rate Cards list displays:
- **Name and Description**: Basic rate card information
- **Currency**: The currency used for pricing
- **Service Count**: Number of services in the rate card
- **Status**: Active or Inactive
- **Created Date**: When the rate card was created

### Filtering and Search

Use the search and filter options to find specific rate cards:
- **Search**: Type in the search box to find rate cards by name or description
- **Currency Filter**: Filter by specific currency
- **Status Filter**: Show only active or inactive rate cards

### Editing Rate Cards

1. Click the **"Edit"** button (pencil icon) next to any rate card
2. The Rate Card Edit dialog opens with two tabs:
   - **Details**: Modify rate card name, description, currency, and status
   - **Services**: Manage the services within this rate card

## Managing Services

### Adding Services to a Rate Card

1. Open the Rate Card Edit dialog
2. Switch to the **"Services"** tab
3. Click **"Add Service"** button
4. Fill in the service details:
   - **Service Name**: Descriptive name for the service
   - **Description**: Additional details about the service
   - **Unit of Measure**: Choose from:
     - **Hour**: Priced per hour
     - **Day**: Priced per day
     - **Fixed**: One-time fixed price
   - **Buy Price**: Your cost for providing this service
   - **Sell Price**: What you charge customers for this service
   - **Tax Class**: Select appropriate tax classification
5. Click **"Add Service"** to save

### Editing Services

1. In the Services tab of a rate card, click **"Edit"** next to any service
2. Modify any of the service details
3. Click **"Save Changes"** to update

### Service Status Management

- Services can be set to **Active** or **Inactive**
- Inactive services are hidden from quote generation but preserved for historical records
- Use the toggle switch in the service edit dialog to change status

## Using Rate Cards in Quotes

### Service Selection

When creating quotes, you can:
1. Select services directly from your rate cards
2. Services maintain their pricing from the rate card
3. Server-calculated totals ensure pricing accuracy
4. Margin information is automatically calculated from buy/sell prices

### Pricing Consistency

- All pricing comes from the server to ensure consistency
- Rate card prices serve as the authoritative source
- No client-side price calculations to prevent discrepancies

## Security and Multi-Tenancy

### Data Isolation

- Rate cards are completely isolated between organizations
- Row-Level Security (RLS) ensures you can only see your own data
- All operations are scoped to your tenant automatically

### Access Control

- Rate card management requires appropriate user permissions
- All changes are audited for compliance and tracking
- Session-based authentication ensures secure access

## Best Practices

### Organization

- Create rate cards by service category or time period
- Use descriptive names that indicate the purpose and timeframe
- Keep rate cards focused on related services

### Pricing Strategy

- Set buy prices to reflect your true costs
- Include overhead and desired margin in sell prices
- Review and update pricing regularly
- Consider creating new rate cards for different time periods rather than modifying existing ones

### Currency Management

- Use consistent currencies within rate cards
- Create separate rate cards for different currencies when needed
- Be aware that currency conversion is not automatic

## Troubleshooting

### Common Issues

**Rate Card Won't Save**
- Check that all required fields are filled
- Ensure currency is selected
- Verify you have appropriate permissions

**Services Not Appearing**
- Check that services are marked as "Active"
- Verify the rate card itself is active
- Ensure you're looking in the correct rate card

**Pricing Discrepancies**
- Remember that all pricing comes from the server
- Check that you're using the correct rate card version
- Verify buy/sell prices are entered correctly

### Getting Help

If you encounter issues:
1. Check this user manual for guidance
2. Contact your system administrator
3. Submit a support ticket through your organization's process

## Future Enhancements

The F2 implementation focuses on services-only rate cards. Future releases will include:
- **Service Bundles**: Package multiple services together
- **Volume Pricing**: Tiered pricing based on quantity
- **Time-Based Pricing**: Different rates for different time periods
- **Advanced Margin Analysis**: Enhanced reporting on profitability

---

*This manual covers the F2 Rate Cards implementation. For additional features and updates, refer to the latest documentation.*

