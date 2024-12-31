export const filterStringValue = (field: string) => ({ [field]: { $type: "string" } }) as const;

export const isEmpty = (input: unknown) => {
    if (typeof input !== "object" || input === null) {
        return false;
    }

    for (const key in input) {
        if (Object.prototype.hasOwnProperty.call(input, key)) {
            return false;
        }
    }

    return true;
};

export const getValue = (obj: unknown, ref: string) => {
    if (typeof obj !== "object") {
        return null;
    }
    if (obj == null) {
        return null;
    }
    // @ts-expect-error Flexible object schema
    return obj[`${ref}`] ?? null;
};

export const dotNotation = (obj: unknown, ref: string) => ref.split(".").reduce(getValue, obj);
