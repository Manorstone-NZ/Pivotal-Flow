/**
 * Customer Module Validation Schemas
 * TypeBox schemas for request/response validation
 */
export declare const CustomerResponseSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    organizationId: import("@sinclair/typebox").TString;
    customerNumber: import("@sinclair/typebox").TString;
    companyName: import("@sinclair/typebox").TString;
    legalName: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    industry: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    website: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    status: import("@sinclair/typebox").TString;
    customerType: import("@sinclair/typebox").TString;
    source: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    tags: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    rating: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    street: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    suburb: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    city: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    region: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    postcode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    country: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    phone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    contactExtras: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
    createdAt: import("@sinclair/typebox").TString;
    updatedAt: import("@sinclair/typebox").TString;
    deletedAt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export declare const ContactResponseSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    customerId: import("@sinclair/typebox").TString;
    organizationId: import("@sinclair/typebox").TString;
    firstName: import("@sinclair/typebox").TString;
    lastName: import("@sinclair/typebox").TString;
    email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    phone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    position: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    department: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    isPrimary: import("@sinclair/typebox").TBoolean;
    notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    contactExtras: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
    createdAt: import("@sinclair/typebox").TString;
    updatedAt: import("@sinclair/typebox").TString;
    deletedAt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export declare const CustomerListResponseSchema: import("@sinclair/typebox").TObject<{
    success: import("@sinclair/typebox").TBoolean;
    data: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        organizationId: import("@sinclair/typebox").TString;
        customerNumber: import("@sinclair/typebox").TString;
        companyName: import("@sinclair/typebox").TString;
        legalName: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        industry: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        website: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        status: import("@sinclair/typebox").TString;
        customerType: import("@sinclair/typebox").TString;
        source: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        tags: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        rating: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        street: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        suburb: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        city: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        region: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        postcode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        country: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        phone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        contactExtras: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
        deletedAt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
    pagination: import("@sinclair/typebox").TObject<{
        page: import("@sinclair/typebox").TNumber;
        limit: import("@sinclair/typebox").TNumber;
        total: import("@sinclair/typebox").TNumber;
        pages: import("@sinclair/typebox").TNumber;
    }>;
}>;
export declare const CustomerDetailResponseSchema: import("@sinclair/typebox").TObject<{
    success: import("@sinclair/typebox").TBoolean;
    data: import("@sinclair/typebox").TIntersect<[import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        organizationId: import("@sinclair/typebox").TString;
        customerNumber: import("@sinclair/typebox").TString;
        companyName: import("@sinclair/typebox").TString;
        legalName: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        industry: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        website: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        status: import("@sinclair/typebox").TString;
        customerType: import("@sinclair/typebox").TString;
        source: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        tags: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        rating: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
        street: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        suburb: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        city: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        region: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        postcode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        country: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        phone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        contactExtras: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
        deletedAt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>, import("@sinclair/typebox").TObject<{
        contacts: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            customerId: import("@sinclair/typebox").TString;
            organizationId: import("@sinclair/typebox").TString;
            firstName: import("@sinclair/typebox").TString;
            lastName: import("@sinclair/typebox").TString;
            email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            phone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            position: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            department: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            isPrimary: import("@sinclair/typebox").TBoolean;
            notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            contactExtras: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
            createdAt: import("@sinclair/typebox").TString;
            updatedAt: import("@sinclair/typebox").TString;
            deletedAt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        }>>>;
    }>]>;
}>;
export declare const ContactListResponseSchema: import("@sinclair/typebox").TObject<{
    success: import("@sinclair/typebox").TBoolean;
    data: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        customerId: import("@sinclair/typebox").TString;
        organizationId: import("@sinclair/typebox").TString;
        firstName: import("@sinclair/typebox").TString;
        lastName: import("@sinclair/typebox").TString;
        email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        phone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        position: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        department: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        isPrimary: import("@sinclair/typebox").TBoolean;
        notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        contactExtras: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
        deletedAt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
}>;
export declare const StandardSuccessResponseSchema: import("@sinclair/typebox").TObject<{
    success: import("@sinclair/typebox").TBoolean;
    message: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export declare const ErrorResponseSchema: import("@sinclair/typebox").TObject<{
    success: import("@sinclair/typebox").TLiteral<false>;
    error: import("@sinclair/typebox").TString;
    message: import("@sinclair/typebox").TString;
    code: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
}>;
export declare const CustomerIdParamSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
}>;
export declare const ContactIdParamSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    contactId: import("@sinclair/typebox").TString;
}>;
export declare const CustomerQuerystringSchema: import("@sinclair/typebox").TObject<{
    page: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    search: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"inactive">, import("@sinclair/typebox").TLiteral<"prospect">]>>;
    customerType: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"business">, import("@sinclair/typebox").TLiteral<"individual">]>>;
    industry: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    source: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    tags: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    sortBy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    sortOrder: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"asc">, import("@sinclair/typebox").TLiteral<"desc">]>>;
}>;
export declare const CreateCustomerBodySchema: import("@sinclair/typebox").TObject<{
    companyName: import("@sinclair/typebox").TString;
    legalName: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    industry: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    website: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    customerType: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"business">, import("@sinclair/typebox").TLiteral<"individual">]>>;
    source: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    tags: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    rating: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    street: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    suburb: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    city: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    region: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    postcode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    country: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    phone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    contactExtras: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
}>;
export declare const UpdateCustomerBodySchema: import("@sinclair/typebox").TObject<{
    companyName: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    legalName: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    industry: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    website: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    customerType: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"business">, import("@sinclair/typebox").TLiteral<"individual">]>>;
    source: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    tags: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    rating: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    street: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    suburb: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    city: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    region: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    postcode: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    country: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    phone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    contactExtras: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
}>;
export declare const CreateContactBodySchema: import("@sinclair/typebox").TObject<{
    firstName: import("@sinclair/typebox").TString;
    lastName: import("@sinclair/typebox").TString;
    email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    phone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    position: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    department: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    isPrimary: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    contactExtras: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
}>;
export declare const UpdateContactBodySchema: import("@sinclair/typebox").TObject<{
    firstName: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    lastName: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    email: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    phone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    position: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    department: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    isPrimary: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    contactExtras: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
}>;
//# sourceMappingURL=schemas.d.ts.map