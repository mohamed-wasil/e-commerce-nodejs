export interface ICreateProductDto {
    name: string;
    description: string;
    basePrice: number | string;
    discount: number | string;
    stock: number | string;
    categoryName: string;
    subCategoryName: string;
    brandName: string
}