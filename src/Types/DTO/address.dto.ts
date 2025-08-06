export interface IAddressDto {
    phone: string;
    country: string;
    city: string;
    street: string;
    postalCode?: string;
    buildingNumber?: string;
    isDefault: boolean;
    label?: string; 
}