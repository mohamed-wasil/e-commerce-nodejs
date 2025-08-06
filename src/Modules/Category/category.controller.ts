import { Router } from "express"
import { authenticationMiddleware, authorizationMiddleware, errorHandllerMiddleware, multerMiddleware, validationMiddleware } from "../../Middlewares"
import categoryService from "./Services/category.service"
import { ImageExtensions } from "../../Types/Enums/enums.type"
import subCategoryService from "./Services/sub-category.service"
import { updateCategorySchema, cretaeCategorySchema, getCategorySchema, updateSubCategorySchema, getSubCategorySchema } from "../../Validators"


export const categoryController = Router()

categoryController.post('/create',
    multerMiddleware([ImageExtensions.PNG, ImageExtensions.JPEG, ImageExtensions.JPG]).single('image'),
    authenticationMiddleware(),
    authorizationMiddleware(),
    validationMiddleware(cretaeCategorySchema),
    errorHandllerMiddleware(categoryService.createCategory)
)
categoryController.put('/update/:categoryId',
    authenticationMiddleware(),
    authorizationMiddleware(),
    multerMiddleware([ImageExtensions.PNG, ImageExtensions.JPEG, ImageExtensions.JPG]).single('image'),
    validationMiddleware(updateCategorySchema),
    errorHandllerMiddleware(categoryService.updateCategory)
)
categoryController.get('/get-spacific-category/:categoryId',
    authenticationMiddleware(),
    validationMiddleware(getCategorySchema),
    errorHandllerMiddleware(categoryService.getSpacificCategory)
)
categoryController.get('/list-categories',
    authenticationMiddleware(),
    errorHandllerMiddleware(categoryService.listCategory)
)
categoryController.delete('/delete/:categoryId',
    authenticationMiddleware(),
    authorizationMiddleware(),
    validationMiddleware(getCategorySchema),
    errorHandllerMiddleware(categoryService.deleteCategory)
)

categoryController.post('/create-sub-category/:categoryId',
    authenticationMiddleware(),
    authorizationMiddleware(),
    multerMiddleware([ImageExtensions.PNG, ImageExtensions.JPEG, ImageExtensions.JPG]).single('image'),
    validationMiddleware(updateCategorySchema),
    errorHandllerMiddleware(subCategoryService.create)
)

categoryController.put('/update-sub-category/:subCategoryId',
    authenticationMiddleware(),
    authorizationMiddleware(),
    multerMiddleware([ImageExtensions.PNG, ImageExtensions.JPEG, ImageExtensions.JPG]).single('image'),
    validationMiddleware(updateSubCategorySchema),
    errorHandllerMiddleware(subCategoryService.update)
)
categoryController.get('/get-spacific-sub-category/:subCategoryId',
    authenticationMiddleware(),
    validationMiddleware(getSubCategorySchema),
    errorHandllerMiddleware(subCategoryService.getSpacificSubCategory)
)
categoryController.get('/list-sub-categories',
    authenticationMiddleware(),
    errorHandllerMiddleware(subCategoryService.listSubCategories)
)
categoryController.delete('/delete-sub-category/:subCategoryId',
    authenticationMiddleware(),
    validationMiddleware(updateSubCategorySchema),
    errorHandllerMiddleware(subCategoryService.deleteSubCategory)
)