import { Decimal } from 'decimal.js';
import { z } from 'zod';
/**
 * Main pricing orchestration module
 * Provides a single calculateQuote function for complete quote calculations
 */
export declare const MoneyAmountSchema: z.ZodObject<{
    amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
    currency: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currency: string;
    amount: Decimal;
}, {
    currency: string;
    amount: Decimal;
}>;
export declare const LineItemSchema: z.ZodObject<{
    description: z.ZodString;
    quantity: z.ZodNumber;
    unitPrice: z.ZodObject<{
        amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        amount: Decimal;
    }, {
        currency: string;
        amount: Decimal;
    }>;
    unit: z.ZodString;
    serviceType: z.ZodOptional<z.ZodString>;
    isTaxExempt: z.ZodOptional<z.ZodBoolean>;
    taxInclusive: z.ZodOptional<z.ZodBoolean>;
    taxRate: z.ZodOptional<z.ZodNumber>;
    discountType: z.ZodOptional<z.ZodEnum<["percentage", "fixed_amount", "per_unit"]>>;
    discountValue: z.ZodOptional<z.ZodNumber>;
    percentageDiscount: z.ZodOptional<z.ZodNumber>;
    fixedDiscount: z.ZodOptional<z.ZodObject<{
        amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        amount: Decimal;
    }, {
        currency: string;
        amount: Decimal;
    }>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    quantity: number;
    unitPrice: {
        currency: string;
        amount: Decimal;
    };
    unit: string;
    taxRate?: number | undefined;
    discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
    discountValue?: number | undefined;
    taxInclusive?: boolean | undefined;
    percentageDiscount?: number | undefined;
    fixedDiscount?: {
        currency: string;
        amount: Decimal;
    } | undefined;
    serviceType?: string | undefined;
    isTaxExempt?: boolean | undefined;
}, {
    description: string;
    quantity: number;
    unitPrice: {
        currency: string;
        amount: Decimal;
    };
    unit: string;
    taxRate?: number | undefined;
    discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
    discountValue?: number | undefined;
    taxInclusive?: boolean | undefined;
    percentageDiscount?: number | undefined;
    fixedDiscount?: {
        currency: string;
        amount: Decimal;
    } | undefined;
    serviceType?: string | undefined;
    isTaxExempt?: boolean | undefined;
}>;
export declare const QuoteDiscountSchema: z.ZodObject<{
    type: z.ZodEnum<["percentage", "fixed_amount", "per_unit"]>;
    value: z.ZodNumber;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "percentage" | "fixed_amount" | "per_unit";
    value: number;
    description?: string | undefined;
}, {
    type: "percentage" | "fixed_amount" | "per_unit";
    value: number;
    description?: string | undefined;
}>;
export declare const CalculateQuoteInputSchema: z.ZodObject<{
    lineItems: z.ZodArray<z.ZodObject<{
        description: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>;
        unit: z.ZodString;
        serviceType: z.ZodOptional<z.ZodString>;
        isTaxExempt: z.ZodOptional<z.ZodBoolean>;
        taxInclusive: z.ZodOptional<z.ZodBoolean>;
        taxRate: z.ZodOptional<z.ZodNumber>;
        discountType: z.ZodOptional<z.ZodEnum<["percentage", "fixed_amount", "per_unit"]>>;
        discountValue: z.ZodOptional<z.ZodNumber>;
        percentageDiscount: z.ZodOptional<z.ZodNumber>;
        fixedDiscount: z.ZodOptional<z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        quantity: number;
        unitPrice: {
            currency: string;
            amount: Decimal;
        };
        unit: string;
        taxRate?: number | undefined;
        discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
        discountValue?: number | undefined;
        taxInclusive?: boolean | undefined;
        percentageDiscount?: number | undefined;
        fixedDiscount?: {
            currency: string;
            amount: Decimal;
        } | undefined;
        serviceType?: string | undefined;
        isTaxExempt?: boolean | undefined;
    }, {
        description: string;
        quantity: number;
        unitPrice: {
            currency: string;
            amount: Decimal;
        };
        unit: string;
        taxRate?: number | undefined;
        discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
        discountValue?: number | undefined;
        taxInclusive?: boolean | undefined;
        percentageDiscount?: number | undefined;
        fixedDiscount?: {
            currency: string;
            amount: Decimal;
        } | undefined;
        serviceType?: string | undefined;
        isTaxExempt?: boolean | undefined;
    }>, "many">;
    quoteDiscount: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["percentage", "fixed_amount", "per_unit"]>;
        value: z.ZodNumber;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "percentage" | "fixed_amount" | "per_unit";
        value: number;
        description?: string | undefined;
    }, {
        type: "percentage" | "fixed_amount" | "per_unit";
        value: number;
        description?: string | undefined;
    }>>;
    currency: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    lineItems: {
        description: string;
        quantity: number;
        unitPrice: {
            currency: string;
            amount: Decimal;
        };
        unit: string;
        taxRate?: number | undefined;
        discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
        discountValue?: number | undefined;
        taxInclusive?: boolean | undefined;
        percentageDiscount?: number | undefined;
        fixedDiscount?: {
            currency: string;
            amount: Decimal;
        } | undefined;
        serviceType?: string | undefined;
        isTaxExempt?: boolean | undefined;
    }[];
    quoteDiscount?: {
        type: "percentage" | "fixed_amount" | "per_unit";
        value: number;
        description?: string | undefined;
    } | undefined;
}, {
    lineItems: {
        description: string;
        quantity: number;
        unitPrice: {
            currency: string;
            amount: Decimal;
        };
        unit: string;
        taxRate?: number | undefined;
        discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
        discountValue?: number | undefined;
        taxInclusive?: boolean | undefined;
        percentageDiscount?: number | undefined;
        fixedDiscount?: {
            currency: string;
            amount: Decimal;
        } | undefined;
        serviceType?: string | undefined;
        isTaxExempt?: boolean | undefined;
    }[];
    currency?: string | undefined;
    quoteDiscount?: {
        type: "percentage" | "fixed_amount" | "per_unit";
        value: number;
        description?: string | undefined;
    } | undefined;
}>;
export declare const LineItemCalculationSchema: z.ZodObject<{
    lineItem: z.ZodObject<{
        description: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>;
        unit: z.ZodString;
        serviceType: z.ZodOptional<z.ZodString>;
        isTaxExempt: z.ZodOptional<z.ZodBoolean>;
        taxInclusive: z.ZodOptional<z.ZodBoolean>;
        taxRate: z.ZodOptional<z.ZodNumber>;
        discountType: z.ZodOptional<z.ZodEnum<["percentage", "fixed_amount", "per_unit"]>>;
        discountValue: z.ZodOptional<z.ZodNumber>;
        percentageDiscount: z.ZodOptional<z.ZodNumber>;
        fixedDiscount: z.ZodOptional<z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>>;
    }, "strip", z.ZodTypeAny, {
        description: string;
        quantity: number;
        unitPrice: {
            currency: string;
            amount: Decimal;
        };
        unit: string;
        taxRate?: number | undefined;
        discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
        discountValue?: number | undefined;
        taxInclusive?: boolean | undefined;
        percentageDiscount?: number | undefined;
        fixedDiscount?: {
            currency: string;
            amount: Decimal;
        } | undefined;
        serviceType?: string | undefined;
        isTaxExempt?: boolean | undefined;
    }, {
        description: string;
        quantity: number;
        unitPrice: {
            currency: string;
            amount: Decimal;
        };
        unit: string;
        taxRate?: number | undefined;
        discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
        discountValue?: number | undefined;
        taxInclusive?: boolean | undefined;
        percentageDiscount?: number | undefined;
        fixedDiscount?: {
            currency: string;
            amount: Decimal;
        } | undefined;
        serviceType?: string | undefined;
        isTaxExempt?: boolean | undefined;
    }>;
    quantity: z.ZodNumber;
    unitPrice: z.ZodObject<{
        amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        amount: Decimal;
    }, {
        currency: string;
        amount: Decimal;
    }>;
    subtotal: z.ZodObject<{
        amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        amount: Decimal;
    }, {
        currency: string;
        amount: Decimal;
    }>;
    discountAmount: z.ZodObject<{
        amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        amount: Decimal;
    }, {
        currency: string;
        amount: Decimal;
    }>;
    taxableAmount: z.ZodObject<{
        amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        amount: Decimal;
    }, {
        currency: string;
        amount: Decimal;
    }>;
    taxAmount: z.ZodObject<{
        amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        amount: Decimal;
    }, {
        currency: string;
        amount: Decimal;
    }>;
    totalAmount: z.ZodObject<{
        amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        amount: Decimal;
    }, {
        currency: string;
        amount: Decimal;
    }>;
}, "strip", z.ZodTypeAny, {
    quantity: number;
    unitPrice: {
        currency: string;
        amount: Decimal;
    };
    taxAmount: {
        currency: string;
        amount: Decimal;
    };
    discountAmount: {
        currency: string;
        amount: Decimal;
    };
    subtotal: {
        currency: string;
        amount: Decimal;
    };
    totalAmount: {
        currency: string;
        amount: Decimal;
    };
    lineItem: {
        description: string;
        quantity: number;
        unitPrice: {
            currency: string;
            amount: Decimal;
        };
        unit: string;
        taxRate?: number | undefined;
        discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
        discountValue?: number | undefined;
        taxInclusive?: boolean | undefined;
        percentageDiscount?: number | undefined;
        fixedDiscount?: {
            currency: string;
            amount: Decimal;
        } | undefined;
        serviceType?: string | undefined;
        isTaxExempt?: boolean | undefined;
    };
    taxableAmount: {
        currency: string;
        amount: Decimal;
    };
}, {
    quantity: number;
    unitPrice: {
        currency: string;
        amount: Decimal;
    };
    taxAmount: {
        currency: string;
        amount: Decimal;
    };
    discountAmount: {
        currency: string;
        amount: Decimal;
    };
    subtotal: {
        currency: string;
        amount: Decimal;
    };
    totalAmount: {
        currency: string;
        amount: Decimal;
    };
    lineItem: {
        description: string;
        quantity: number;
        unitPrice: {
            currency: string;
            amount: Decimal;
        };
        unit: string;
        taxRate?: number | undefined;
        discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
        discountValue?: number | undefined;
        taxInclusive?: boolean | undefined;
        percentageDiscount?: number | undefined;
        fixedDiscount?: {
            currency: string;
            amount: Decimal;
        } | undefined;
        serviceType?: string | undefined;
        isTaxExempt?: boolean | undefined;
    };
    taxableAmount: {
        currency: string;
        amount: Decimal;
    };
}>;
export declare const QuoteCalculationSchema: z.ZodObject<{
    lineCalculations: z.ZodArray<z.ZodObject<{
        lineItem: z.ZodObject<{
            description: z.ZodString;
            quantity: z.ZodNumber;
            unitPrice: z.ZodObject<{
                amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                currency: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                currency: string;
                amount: Decimal;
            }, {
                currency: string;
                amount: Decimal;
            }>;
            unit: z.ZodString;
            serviceType: z.ZodOptional<z.ZodString>;
            isTaxExempt: z.ZodOptional<z.ZodBoolean>;
            taxInclusive: z.ZodOptional<z.ZodBoolean>;
            taxRate: z.ZodOptional<z.ZodNumber>;
            discountType: z.ZodOptional<z.ZodEnum<["percentage", "fixed_amount", "per_unit"]>>;
            discountValue: z.ZodOptional<z.ZodNumber>;
            percentageDiscount: z.ZodOptional<z.ZodNumber>;
            fixedDiscount: z.ZodOptional<z.ZodObject<{
                amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                currency: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                currency: string;
                amount: Decimal;
            }, {
                currency: string;
                amount: Decimal;
            }>>;
        }, "strip", z.ZodTypeAny, {
            description: string;
            quantity: number;
            unitPrice: {
                currency: string;
                amount: Decimal;
            };
            unit: string;
            taxRate?: number | undefined;
            discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
            discountValue?: number | undefined;
            taxInclusive?: boolean | undefined;
            percentageDiscount?: number | undefined;
            fixedDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
            serviceType?: string | undefined;
            isTaxExempt?: boolean | undefined;
        }, {
            description: string;
            quantity: number;
            unitPrice: {
                currency: string;
                amount: Decimal;
            };
            unit: string;
            taxRate?: number | undefined;
            discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
            discountValue?: number | undefined;
            taxInclusive?: boolean | undefined;
            percentageDiscount?: number | undefined;
            fixedDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
            serviceType?: string | undefined;
            isTaxExempt?: boolean | undefined;
        }>;
        quantity: z.ZodNumber;
        unitPrice: z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>;
        subtotal: z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>;
        discountAmount: z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>;
        taxableAmount: z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>;
        taxAmount: z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>;
        totalAmount: z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>;
    }, "strip", z.ZodTypeAny, {
        quantity: number;
        unitPrice: {
            currency: string;
            amount: Decimal;
        };
        taxAmount: {
            currency: string;
            amount: Decimal;
        };
        discountAmount: {
            currency: string;
            amount: Decimal;
        };
        subtotal: {
            currency: string;
            amount: Decimal;
        };
        totalAmount: {
            currency: string;
            amount: Decimal;
        };
        lineItem: {
            description: string;
            quantity: number;
            unitPrice: {
                currency: string;
                amount: Decimal;
            };
            unit: string;
            taxRate?: number | undefined;
            discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
            discountValue?: number | undefined;
            taxInclusive?: boolean | undefined;
            percentageDiscount?: number | undefined;
            fixedDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
            serviceType?: string | undefined;
            isTaxExempt?: boolean | undefined;
        };
        taxableAmount: {
            currency: string;
            amount: Decimal;
        };
    }, {
        quantity: number;
        unitPrice: {
            currency: string;
            amount: Decimal;
        };
        taxAmount: {
            currency: string;
            amount: Decimal;
        };
        discountAmount: {
            currency: string;
            amount: Decimal;
        };
        subtotal: {
            currency: string;
            amount: Decimal;
        };
        totalAmount: {
            currency: string;
            amount: Decimal;
        };
        lineItem: {
            description: string;
            quantity: number;
            unitPrice: {
                currency: string;
                amount: Decimal;
            };
            unit: string;
            taxRate?: number | undefined;
            discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
            discountValue?: number | undefined;
            taxInclusive?: boolean | undefined;
            percentageDiscount?: number | undefined;
            fixedDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
            serviceType?: string | undefined;
            isTaxExempt?: boolean | undefined;
        };
        taxableAmount: {
            currency: string;
            amount: Decimal;
        };
    }>, "many">;
    totals: z.ZodObject<{
        subtotal: z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>;
        discountAmount: z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>;
        taxableAmount: z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>;
        taxAmount: z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>;
        grandTotal: z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>;
        currency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        taxAmount: {
            currency: string;
            amount: Decimal;
        };
        discountAmount: {
            currency: string;
            amount: Decimal;
        };
        subtotal: {
            currency: string;
            amount: Decimal;
        };
        currency: string;
        grandTotal: {
            currency: string;
            amount: Decimal;
        };
        taxableAmount: {
            currency: string;
            amount: Decimal;
        };
    }, {
        taxAmount: {
            currency: string;
            amount: Decimal;
        };
        discountAmount: {
            currency: string;
            amount: Decimal;
        };
        subtotal: {
            currency: string;
            amount: Decimal;
        };
        currency: string;
        grandTotal: {
            currency: string;
            amount: Decimal;
        };
        taxableAmount: {
            currency: string;
            amount: Decimal;
        };
    }>;
    summary: z.ZodObject<{
        totalQuantity: z.ZodNumber;
        subtotal: z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>;
        totalDiscount: z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>;
        totalTaxable: z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>;
        totalTax: z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>;
        totalAmount: z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>;
    }, "strip", z.ZodTypeAny, {
        subtotal: {
            currency: string;
            amount: Decimal;
        };
        totalAmount: {
            currency: string;
            amount: Decimal;
        };
        totalQuantity: number;
        totalDiscount: {
            currency: string;
            amount: Decimal;
        };
        totalTaxable: {
            currency: string;
            amount: Decimal;
        };
        totalTax: {
            currency: string;
            amount: Decimal;
        };
    }, {
        subtotal: {
            currency: string;
            amount: Decimal;
        };
        totalAmount: {
            currency: string;
            amount: Decimal;
        };
        totalQuantity: number;
        totalDiscount: {
            currency: string;
            amount: Decimal;
        };
        totalTaxable: {
            currency: string;
            amount: Decimal;
        };
        totalTax: {
            currency: string;
            amount: Decimal;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    summary: {
        subtotal: {
            currency: string;
            amount: Decimal;
        };
        totalAmount: {
            currency: string;
            amount: Decimal;
        };
        totalQuantity: number;
        totalDiscount: {
            currency: string;
            amount: Decimal;
        };
        totalTaxable: {
            currency: string;
            amount: Decimal;
        };
        totalTax: {
            currency: string;
            amount: Decimal;
        };
    };
    totals: {
        taxAmount: {
            currency: string;
            amount: Decimal;
        };
        discountAmount: {
            currency: string;
            amount: Decimal;
        };
        subtotal: {
            currency: string;
            amount: Decimal;
        };
        currency: string;
        grandTotal: {
            currency: string;
            amount: Decimal;
        };
        taxableAmount: {
            currency: string;
            amount: Decimal;
        };
    };
    lineCalculations: {
        quantity: number;
        unitPrice: {
            currency: string;
            amount: Decimal;
        };
        taxAmount: {
            currency: string;
            amount: Decimal;
        };
        discountAmount: {
            currency: string;
            amount: Decimal;
        };
        subtotal: {
            currency: string;
            amount: Decimal;
        };
        totalAmount: {
            currency: string;
            amount: Decimal;
        };
        lineItem: {
            description: string;
            quantity: number;
            unitPrice: {
                currency: string;
                amount: Decimal;
            };
            unit: string;
            taxRate?: number | undefined;
            discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
            discountValue?: number | undefined;
            taxInclusive?: boolean | undefined;
            percentageDiscount?: number | undefined;
            fixedDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
            serviceType?: string | undefined;
            isTaxExempt?: boolean | undefined;
        };
        taxableAmount: {
            currency: string;
            amount: Decimal;
        };
    }[];
}, {
    summary: {
        subtotal: {
            currency: string;
            amount: Decimal;
        };
        totalAmount: {
            currency: string;
            amount: Decimal;
        };
        totalQuantity: number;
        totalDiscount: {
            currency: string;
            amount: Decimal;
        };
        totalTaxable: {
            currency: string;
            amount: Decimal;
        };
        totalTax: {
            currency: string;
            amount: Decimal;
        };
    };
    totals: {
        taxAmount: {
            currency: string;
            amount: Decimal;
        };
        discountAmount: {
            currency: string;
            amount: Decimal;
        };
        subtotal: {
            currency: string;
            amount: Decimal;
        };
        currency: string;
        grandTotal: {
            currency: string;
            amount: Decimal;
        };
        taxableAmount: {
            currency: string;
            amount: Decimal;
        };
    };
    lineCalculations: {
        quantity: number;
        unitPrice: {
            currency: string;
            amount: Decimal;
        };
        taxAmount: {
            currency: string;
            amount: Decimal;
        };
        discountAmount: {
            currency: string;
            amount: Decimal;
        };
        subtotal: {
            currency: string;
            amount: Decimal;
        };
        totalAmount: {
            currency: string;
            amount: Decimal;
        };
        lineItem: {
            description: string;
            quantity: number;
            unitPrice: {
                currency: string;
                amount: Decimal;
            };
            unit: string;
            taxRate?: number | undefined;
            discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
            discountValue?: number | undefined;
            taxInclusive?: boolean | undefined;
            percentageDiscount?: number | undefined;
            fixedDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
            serviceType?: string | undefined;
            isTaxExempt?: boolean | undefined;
        };
        taxableAmount: {
            currency: string;
            amount: Decimal;
        };
    }[];
}>;
export declare const LineItemDebugSchema: z.ZodObject<{
    lineNumber: z.ZodNumber;
    description: z.ZodString;
    steps: z.ZodObject<{
        input: z.ZodObject<{
            quantity: z.ZodNumber;
            unitPrice: z.ZodObject<{
                amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                currency: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                currency: string;
                amount: Decimal;
            }, {
                currency: string;
                amount: Decimal;
            }>;
            taxInclusive: z.ZodBoolean;
            taxRate: z.ZodNumber;
            discountType: z.ZodOptional<z.ZodEnum<["percentage", "fixed_amount", "per_unit"]>>;
            discountValue: z.ZodOptional<z.ZodNumber>;
            percentageDiscount: z.ZodOptional<z.ZodNumber>;
            fixedDiscount: z.ZodOptional<z.ZodObject<{
                amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                currency: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                currency: string;
                amount: Decimal;
            }, {
                currency: string;
                amount: Decimal;
            }>>;
        }, "strip", z.ZodTypeAny, {
            quantity: number;
            unitPrice: {
                currency: string;
                amount: Decimal;
            };
            taxRate: number;
            taxInclusive: boolean;
            discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
            discountValue?: number | undefined;
            percentageDiscount?: number | undefined;
            fixedDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
        }, {
            quantity: number;
            unitPrice: {
                currency: string;
                amount: Decimal;
            };
            taxRate: number;
            taxInclusive: boolean;
            discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
            discountValue?: number | undefined;
            percentageDiscount?: number | undefined;
            fixedDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
        }>;
        calculations: z.ZodObject<{
            subtotal: z.ZodObject<{
                amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                currency: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                currency: string;
                amount: Decimal;
            }, {
                currency: string;
                amount: Decimal;
            }>;
            percentageDiscount: z.ZodOptional<z.ZodObject<{
                amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                currency: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                currency: string;
                amount: Decimal;
            }, {
                currency: string;
                amount: Decimal;
            }>>;
            fixedDiscount: z.ZodOptional<z.ZodObject<{
                amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                currency: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                currency: string;
                amount: Decimal;
            }, {
                currency: string;
                amount: Decimal;
            }>>;
            taxableAmount: z.ZodObject<{
                amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                currency: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                currency: string;
                amount: Decimal;
            }, {
                currency: string;
                amount: Decimal;
            }>;
            taxAmount: z.ZodObject<{
                amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                currency: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                currency: string;
                amount: Decimal;
            }, {
                currency: string;
                amount: Decimal;
            }>;
            totalAmount: z.ZodObject<{
                amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                currency: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                currency: string;
                amount: Decimal;
            }, {
                currency: string;
                amount: Decimal;
            }>;
        }, "strip", z.ZodTypeAny, {
            taxAmount: {
                currency: string;
                amount: Decimal;
            };
            subtotal: {
                currency: string;
                amount: Decimal;
            };
            totalAmount: {
                currency: string;
                amount: Decimal;
            };
            taxableAmount: {
                currency: string;
                amount: Decimal;
            };
            percentageDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
            fixedDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
        }, {
            taxAmount: {
                currency: string;
                amount: Decimal;
            };
            subtotal: {
                currency: string;
                amount: Decimal;
            };
            totalAmount: {
                currency: string;
                amount: Decimal;
            };
            taxableAmount: {
                currency: string;
                amount: Decimal;
            };
            percentageDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
            fixedDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
        }>;
        breakdown: z.ZodObject<{
            subtotal: z.ZodString;
            discount: z.ZodString;
            taxable: z.ZodString;
            tax: z.ZodString;
            total: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            subtotal: string;
            total: string;
            discount: string;
            tax: string;
            taxable: string;
        }, {
            subtotal: string;
            total: string;
            discount: string;
            tax: string;
            taxable: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        calculations: {
            taxAmount: {
                currency: string;
                amount: Decimal;
            };
            subtotal: {
                currency: string;
                amount: Decimal;
            };
            totalAmount: {
                currency: string;
                amount: Decimal;
            };
            taxableAmount: {
                currency: string;
                amount: Decimal;
            };
            percentageDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
            fixedDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
        };
        breakdown: {
            subtotal: string;
            total: string;
            discount: string;
            tax: string;
            taxable: string;
        };
        input: {
            quantity: number;
            unitPrice: {
                currency: string;
                amount: Decimal;
            };
            taxRate: number;
            taxInclusive: boolean;
            discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
            discountValue?: number | undefined;
            percentageDiscount?: number | undefined;
            fixedDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
        };
    }, {
        calculations: {
            taxAmount: {
                currency: string;
                amount: Decimal;
            };
            subtotal: {
                currency: string;
                amount: Decimal;
            };
            totalAmount: {
                currency: string;
                amount: Decimal;
            };
            taxableAmount: {
                currency: string;
                amount: Decimal;
            };
            percentageDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
            fixedDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
        };
        breakdown: {
            subtotal: string;
            total: string;
            discount: string;
            tax: string;
            taxable: string;
        };
        input: {
            quantity: number;
            unitPrice: {
                currency: string;
                amount: Decimal;
            };
            taxRate: number;
            taxInclusive: boolean;
            discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
            discountValue?: number | undefined;
            percentageDiscount?: number | undefined;
            fixedDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
        };
    }>;
}, "strip", z.ZodTypeAny, {
    lineNumber: number;
    description: string;
    steps: {
        calculations: {
            taxAmount: {
                currency: string;
                amount: Decimal;
            };
            subtotal: {
                currency: string;
                amount: Decimal;
            };
            totalAmount: {
                currency: string;
                amount: Decimal;
            };
            taxableAmount: {
                currency: string;
                amount: Decimal;
            };
            percentageDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
            fixedDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
        };
        breakdown: {
            subtotal: string;
            total: string;
            discount: string;
            tax: string;
            taxable: string;
        };
        input: {
            quantity: number;
            unitPrice: {
                currency: string;
                amount: Decimal;
            };
            taxRate: number;
            taxInclusive: boolean;
            discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
            discountValue?: number | undefined;
            percentageDiscount?: number | undefined;
            fixedDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
        };
    };
}, {
    lineNumber: number;
    description: string;
    steps: {
        calculations: {
            taxAmount: {
                currency: string;
                amount: Decimal;
            };
            subtotal: {
                currency: string;
                amount: Decimal;
            };
            totalAmount: {
                currency: string;
                amount: Decimal;
            };
            taxableAmount: {
                currency: string;
                amount: Decimal;
            };
            percentageDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
            fixedDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
        };
        breakdown: {
            subtotal: string;
            total: string;
            discount: string;
            tax: string;
            taxable: string;
        };
        input: {
            quantity: number;
            unitPrice: {
                currency: string;
                amount: Decimal;
            };
            taxRate: number;
            taxInclusive: boolean;
            discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
            discountValue?: number | undefined;
            percentageDiscount?: number | undefined;
            fixedDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
        };
    };
}>;
export declare const QuoteDebugSchema: z.ZodObject<{
    lineCalculations: z.ZodArray<z.ZodObject<{
        lineNumber: z.ZodNumber;
        description: z.ZodString;
        steps: z.ZodObject<{
            input: z.ZodObject<{
                quantity: z.ZodNumber;
                unitPrice: z.ZodObject<{
                    amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                    currency: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    currency: string;
                    amount: Decimal;
                }, {
                    currency: string;
                    amount: Decimal;
                }>;
                taxInclusive: z.ZodBoolean;
                taxRate: z.ZodNumber;
                discountType: z.ZodOptional<z.ZodEnum<["percentage", "fixed_amount", "per_unit"]>>;
                discountValue: z.ZodOptional<z.ZodNumber>;
                percentageDiscount: z.ZodOptional<z.ZodNumber>;
                fixedDiscount: z.ZodOptional<z.ZodObject<{
                    amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                    currency: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    currency: string;
                    amount: Decimal;
                }, {
                    currency: string;
                    amount: Decimal;
                }>>;
            }, "strip", z.ZodTypeAny, {
                quantity: number;
                unitPrice: {
                    currency: string;
                    amount: Decimal;
                };
                taxRate: number;
                taxInclusive: boolean;
                discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
                discountValue?: number | undefined;
                percentageDiscount?: number | undefined;
                fixedDiscount?: {
                    currency: string;
                    amount: Decimal;
                } | undefined;
            }, {
                quantity: number;
                unitPrice: {
                    currency: string;
                    amount: Decimal;
                };
                taxRate: number;
                taxInclusive: boolean;
                discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
                discountValue?: number | undefined;
                percentageDiscount?: number | undefined;
                fixedDiscount?: {
                    currency: string;
                    amount: Decimal;
                } | undefined;
            }>;
            calculations: z.ZodObject<{
                subtotal: z.ZodObject<{
                    amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                    currency: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    currency: string;
                    amount: Decimal;
                }, {
                    currency: string;
                    amount: Decimal;
                }>;
                percentageDiscount: z.ZodOptional<z.ZodObject<{
                    amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                    currency: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    currency: string;
                    amount: Decimal;
                }, {
                    currency: string;
                    amount: Decimal;
                }>>;
                fixedDiscount: z.ZodOptional<z.ZodObject<{
                    amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                    currency: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    currency: string;
                    amount: Decimal;
                }, {
                    currency: string;
                    amount: Decimal;
                }>>;
                taxableAmount: z.ZodObject<{
                    amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                    currency: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    currency: string;
                    amount: Decimal;
                }, {
                    currency: string;
                    amount: Decimal;
                }>;
                taxAmount: z.ZodObject<{
                    amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                    currency: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    currency: string;
                    amount: Decimal;
                }, {
                    currency: string;
                    amount: Decimal;
                }>;
                totalAmount: z.ZodObject<{
                    amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                    currency: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    currency: string;
                    amount: Decimal;
                }, {
                    currency: string;
                    amount: Decimal;
                }>;
            }, "strip", z.ZodTypeAny, {
                taxAmount: {
                    currency: string;
                    amount: Decimal;
                };
                subtotal: {
                    currency: string;
                    amount: Decimal;
                };
                totalAmount: {
                    currency: string;
                    amount: Decimal;
                };
                taxableAmount: {
                    currency: string;
                    amount: Decimal;
                };
                percentageDiscount?: {
                    currency: string;
                    amount: Decimal;
                } | undefined;
                fixedDiscount?: {
                    currency: string;
                    amount: Decimal;
                } | undefined;
            }, {
                taxAmount: {
                    currency: string;
                    amount: Decimal;
                };
                subtotal: {
                    currency: string;
                    amount: Decimal;
                };
                totalAmount: {
                    currency: string;
                    amount: Decimal;
                };
                taxableAmount: {
                    currency: string;
                    amount: Decimal;
                };
                percentageDiscount?: {
                    currency: string;
                    amount: Decimal;
                } | undefined;
                fixedDiscount?: {
                    currency: string;
                    amount: Decimal;
                } | undefined;
            }>;
            breakdown: z.ZodObject<{
                subtotal: z.ZodString;
                discount: z.ZodString;
                taxable: z.ZodString;
                tax: z.ZodString;
                total: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                subtotal: string;
                total: string;
                discount: string;
                tax: string;
                taxable: string;
            }, {
                subtotal: string;
                total: string;
                discount: string;
                tax: string;
                taxable: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            calculations: {
                taxAmount: {
                    currency: string;
                    amount: Decimal;
                };
                subtotal: {
                    currency: string;
                    amount: Decimal;
                };
                totalAmount: {
                    currency: string;
                    amount: Decimal;
                };
                taxableAmount: {
                    currency: string;
                    amount: Decimal;
                };
                percentageDiscount?: {
                    currency: string;
                    amount: Decimal;
                } | undefined;
                fixedDiscount?: {
                    currency: string;
                    amount: Decimal;
                } | undefined;
            };
            breakdown: {
                subtotal: string;
                total: string;
                discount: string;
                tax: string;
                taxable: string;
            };
            input: {
                quantity: number;
                unitPrice: {
                    currency: string;
                    amount: Decimal;
                };
                taxRate: number;
                taxInclusive: boolean;
                discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
                discountValue?: number | undefined;
                percentageDiscount?: number | undefined;
                fixedDiscount?: {
                    currency: string;
                    amount: Decimal;
                } | undefined;
            };
        }, {
            calculations: {
                taxAmount: {
                    currency: string;
                    amount: Decimal;
                };
                subtotal: {
                    currency: string;
                    amount: Decimal;
                };
                totalAmount: {
                    currency: string;
                    amount: Decimal;
                };
                taxableAmount: {
                    currency: string;
                    amount: Decimal;
                };
                percentageDiscount?: {
                    currency: string;
                    amount: Decimal;
                } | undefined;
                fixedDiscount?: {
                    currency: string;
                    amount: Decimal;
                } | undefined;
            };
            breakdown: {
                subtotal: string;
                total: string;
                discount: string;
                tax: string;
                taxable: string;
            };
            input: {
                quantity: number;
                unitPrice: {
                    currency: string;
                    amount: Decimal;
                };
                taxRate: number;
                taxInclusive: boolean;
                discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
                discountValue?: number | undefined;
                percentageDiscount?: number | undefined;
                fixedDiscount?: {
                    currency: string;
                    amount: Decimal;
                } | undefined;
            };
        }>;
    }, "strip", z.ZodTypeAny, {
        lineNumber: number;
        description: string;
        steps: {
            calculations: {
                taxAmount: {
                    currency: string;
                    amount: Decimal;
                };
                subtotal: {
                    currency: string;
                    amount: Decimal;
                };
                totalAmount: {
                    currency: string;
                    amount: Decimal;
                };
                taxableAmount: {
                    currency: string;
                    amount: Decimal;
                };
                percentageDiscount?: {
                    currency: string;
                    amount: Decimal;
                } | undefined;
                fixedDiscount?: {
                    currency: string;
                    amount: Decimal;
                } | undefined;
            };
            breakdown: {
                subtotal: string;
                total: string;
                discount: string;
                tax: string;
                taxable: string;
            };
            input: {
                quantity: number;
                unitPrice: {
                    currency: string;
                    amount: Decimal;
                };
                taxRate: number;
                taxInclusive: boolean;
                discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
                discountValue?: number | undefined;
                percentageDiscount?: number | undefined;
                fixedDiscount?: {
                    currency: string;
                    amount: Decimal;
                } | undefined;
            };
        };
    }, {
        lineNumber: number;
        description: string;
        steps: {
            calculations: {
                taxAmount: {
                    currency: string;
                    amount: Decimal;
                };
                subtotal: {
                    currency: string;
                    amount: Decimal;
                };
                totalAmount: {
                    currency: string;
                    amount: Decimal;
                };
                taxableAmount: {
                    currency: string;
                    amount: Decimal;
                };
                percentageDiscount?: {
                    currency: string;
                    amount: Decimal;
                } | undefined;
                fixedDiscount?: {
                    currency: string;
                    amount: Decimal;
                } | undefined;
            };
            breakdown: {
                subtotal: string;
                total: string;
                discount: string;
                tax: string;
                taxable: string;
            };
            input: {
                quantity: number;
                unitPrice: {
                    currency: string;
                    amount: Decimal;
                };
                taxRate: number;
                taxInclusive: boolean;
                discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
                discountValue?: number | undefined;
                percentageDiscount?: number | undefined;
                fixedDiscount?: {
                    currency: string;
                    amount: Decimal;
                } | undefined;
            };
        };
    }>, "many">;
    quoteCalculations: z.ZodObject<{
        input: z.ZodObject<{
            lineTotals: z.ZodArray<z.ZodObject<{
                amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                currency: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                currency: string;
                amount: Decimal;
            }, {
                currency: string;
                amount: Decimal;
            }>, "many">;
            quoteDiscountType: z.ZodOptional<z.ZodEnum<["percentage", "fixed_amount", "per_unit"]>>;
            quoteDiscountValue: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            lineTotals: {
                currency: string;
                amount: Decimal;
            }[];
            quoteDiscountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
            quoteDiscountValue?: number | undefined;
        }, {
            lineTotals: {
                currency: string;
                amount: Decimal;
            }[];
            quoteDiscountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
            quoteDiscountValue?: number | undefined;
        }>;
        calculations: z.ZodObject<{
            subtotal: z.ZodObject<{
                amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                currency: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                currency: string;
                amount: Decimal;
            }, {
                currency: string;
                amount: Decimal;
            }>;
            quotePercentageDiscount: z.ZodOptional<z.ZodObject<{
                amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                currency: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                currency: string;
                amount: Decimal;
            }, {
                currency: string;
                amount: Decimal;
            }>>;
            quoteFixedDiscount: z.ZodOptional<z.ZodObject<{
                amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                currency: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                currency: string;
                amount: Decimal;
            }, {
                currency: string;
                amount: Decimal;
            }>>;
            taxableAmount: z.ZodObject<{
                amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                currency: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                currency: string;
                amount: Decimal;
            }, {
                currency: string;
                amount: Decimal;
            }>;
            taxAmount: z.ZodObject<{
                amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                currency: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                currency: string;
                amount: Decimal;
            }, {
                currency: string;
                amount: Decimal;
            }>;
            grandTotal: z.ZodObject<{
                amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
                currency: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                currency: string;
                amount: Decimal;
            }, {
                currency: string;
                amount: Decimal;
            }>;
        }, "strip", z.ZodTypeAny, {
            taxAmount: {
                currency: string;
                amount: Decimal;
            };
            subtotal: {
                currency: string;
                amount: Decimal;
            };
            grandTotal: {
                currency: string;
                amount: Decimal;
            };
            taxableAmount: {
                currency: string;
                amount: Decimal;
            };
            quotePercentageDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
            quoteFixedDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
        }, {
            taxAmount: {
                currency: string;
                amount: Decimal;
            };
            subtotal: {
                currency: string;
                amount: Decimal;
            };
            grandTotal: {
                currency: string;
                amount: Decimal;
            };
            taxableAmount: {
                currency: string;
                amount: Decimal;
            };
            quotePercentageDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
            quoteFixedDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
        }>;
        breakdown: z.ZodObject<{
            subtotal: z.ZodString;
            discount: z.ZodString;
            taxable: z.ZodString;
            tax: z.ZodString;
            grandTotal: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            subtotal: string;
            discount: string;
            tax: string;
            grandTotal: string;
            taxable: string;
        }, {
            subtotal: string;
            discount: string;
            tax: string;
            grandTotal: string;
            taxable: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        calculations: {
            taxAmount: {
                currency: string;
                amount: Decimal;
            };
            subtotal: {
                currency: string;
                amount: Decimal;
            };
            grandTotal: {
                currency: string;
                amount: Decimal;
            };
            taxableAmount: {
                currency: string;
                amount: Decimal;
            };
            quotePercentageDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
            quoteFixedDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
        };
        breakdown: {
            subtotal: string;
            discount: string;
            tax: string;
            grandTotal: string;
            taxable: string;
        };
        input: {
            lineTotals: {
                currency: string;
                amount: Decimal;
            }[];
            quoteDiscountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
            quoteDiscountValue?: number | undefined;
        };
    }, {
        calculations: {
            taxAmount: {
                currency: string;
                amount: Decimal;
            };
            subtotal: {
                currency: string;
                amount: Decimal;
            };
            grandTotal: {
                currency: string;
                amount: Decimal;
            };
            taxableAmount: {
                currency: string;
                amount: Decimal;
            };
            quotePercentageDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
            quoteFixedDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
        };
        breakdown: {
            subtotal: string;
            discount: string;
            tax: string;
            grandTotal: string;
            taxable: string;
        };
        input: {
            lineTotals: {
                currency: string;
                amount: Decimal;
            }[];
            quoteDiscountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
            quoteDiscountValue?: number | undefined;
        };
    }>;
    taxBreakdown: z.ZodArray<z.ZodObject<{
        rate: z.ZodNumber;
        taxableAmount: z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>;
        taxAmount: z.ZodObject<{
            amount: z.ZodType<Decimal, z.ZodTypeDef, Decimal>;
            currency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currency: string;
            amount: Decimal;
        }, {
            currency: string;
            amount: Decimal;
        }>;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        description: string;
        taxAmount: {
            currency: string;
            amount: Decimal;
        };
        rate: number;
        taxableAmount: {
            currency: string;
            amount: Decimal;
        };
    }, {
        description: string;
        taxAmount: {
            currency: string;
            amount: Decimal;
        };
        rate: number;
        taxableAmount: {
            currency: string;
            amount: Decimal;
        };
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    lineCalculations: {
        lineNumber: number;
        description: string;
        steps: {
            calculations: {
                taxAmount: {
                    currency: string;
                    amount: Decimal;
                };
                subtotal: {
                    currency: string;
                    amount: Decimal;
                };
                totalAmount: {
                    currency: string;
                    amount: Decimal;
                };
                taxableAmount: {
                    currency: string;
                    amount: Decimal;
                };
                percentageDiscount?: {
                    currency: string;
                    amount: Decimal;
                } | undefined;
                fixedDiscount?: {
                    currency: string;
                    amount: Decimal;
                } | undefined;
            };
            breakdown: {
                subtotal: string;
                total: string;
                discount: string;
                tax: string;
                taxable: string;
            };
            input: {
                quantity: number;
                unitPrice: {
                    currency: string;
                    amount: Decimal;
                };
                taxRate: number;
                taxInclusive: boolean;
                discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
                discountValue?: number | undefined;
                percentageDiscount?: number | undefined;
                fixedDiscount?: {
                    currency: string;
                    amount: Decimal;
                } | undefined;
            };
        };
    }[];
    quoteCalculations: {
        calculations: {
            taxAmount: {
                currency: string;
                amount: Decimal;
            };
            subtotal: {
                currency: string;
                amount: Decimal;
            };
            grandTotal: {
                currency: string;
                amount: Decimal;
            };
            taxableAmount: {
                currency: string;
                amount: Decimal;
            };
            quotePercentageDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
            quoteFixedDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
        };
        breakdown: {
            subtotal: string;
            discount: string;
            tax: string;
            grandTotal: string;
            taxable: string;
        };
        input: {
            lineTotals: {
                currency: string;
                amount: Decimal;
            }[];
            quoteDiscountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
            quoteDiscountValue?: number | undefined;
        };
    };
    taxBreakdown: {
        description: string;
        taxAmount: {
            currency: string;
            amount: Decimal;
        };
        rate: number;
        taxableAmount: {
            currency: string;
            amount: Decimal;
        };
    }[];
}, {
    lineCalculations: {
        lineNumber: number;
        description: string;
        steps: {
            calculations: {
                taxAmount: {
                    currency: string;
                    amount: Decimal;
                };
                subtotal: {
                    currency: string;
                    amount: Decimal;
                };
                totalAmount: {
                    currency: string;
                    amount: Decimal;
                };
                taxableAmount: {
                    currency: string;
                    amount: Decimal;
                };
                percentageDiscount?: {
                    currency: string;
                    amount: Decimal;
                } | undefined;
                fixedDiscount?: {
                    currency: string;
                    amount: Decimal;
                } | undefined;
            };
            breakdown: {
                subtotal: string;
                total: string;
                discount: string;
                tax: string;
                taxable: string;
            };
            input: {
                quantity: number;
                unitPrice: {
                    currency: string;
                    amount: Decimal;
                };
                taxRate: number;
                taxInclusive: boolean;
                discountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
                discountValue?: number | undefined;
                percentageDiscount?: number | undefined;
                fixedDiscount?: {
                    currency: string;
                    amount: Decimal;
                } | undefined;
            };
        };
    }[];
    quoteCalculations: {
        calculations: {
            taxAmount: {
                currency: string;
                amount: Decimal;
            };
            subtotal: {
                currency: string;
                amount: Decimal;
            };
            grandTotal: {
                currency: string;
                amount: Decimal;
            };
            taxableAmount: {
                currency: string;
                amount: Decimal;
            };
            quotePercentageDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
            quoteFixedDiscount?: {
                currency: string;
                amount: Decimal;
            } | undefined;
        };
        breakdown: {
            subtotal: string;
            discount: string;
            tax: string;
            grandTotal: string;
            taxable: string;
        };
        input: {
            lineTotals: {
                currency: string;
                amount: Decimal;
            }[];
            quoteDiscountType?: "percentage" | "fixed_amount" | "per_unit" | undefined;
            quoteDiscountValue?: number | undefined;
        };
    };
    taxBreakdown: {
        description: string;
        taxAmount: {
            currency: string;
            amount: Decimal;
        };
        rate: number;
        taxableAmount: {
            currency: string;
            amount: Decimal;
        };
    }[];
}>;
export type CalculateQuoteInput = z.infer<typeof CalculateQuoteInputSchema>;
export type QuoteCalculation = z.infer<typeof QuoteCalculationSchema>;
export type QuoteDebugOutput = z.infer<typeof QuoteDebugSchema>;
/**
 * Main quote calculation function
 * Orchestrates all pricing calculations with proper validation and error handling
 */
export declare function calculateQuote(input: CalculateQuoteInput, currencyDecimals?: number): QuoteCalculation;
/**
 * Debug quote calculation function
 * Returns detailed intermediate calculation steps
 */
export declare function calculateQuoteDebug(input: CalculateQuoteInput): QuoteDebugOutput;
/**
 * Validate quote calculation input without performing calculations
 */
export declare function validateQuoteInput(input: unknown): boolean;
/**
 * Get calculation breakdown for display purposes
 */
export declare function getQuoteBreakdown(calculation: QuoteCalculation): {
    lineItems: Array<{
        description: string;
        quantity: string;
        unitPrice: string;
        subtotal: string;
        discount: string;
        tax: string;
        total: string;
    }>;
    totals: {
        subtotal: string;
        discount: string;
        taxable: string;
        tax: string;
        grandTotal: string;
    };
};
export * from './money.js';
export * from './taxes.js';
export * from './discounts.js';
export * from './lines.js';
export * from './totals.js';
//# sourceMappingURL=index.d.ts.map