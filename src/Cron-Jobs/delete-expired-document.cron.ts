import cron from "node-cron"
import { BrandRepository, CategoryRepository, ProductRepository, SubCategoryRepository, UserRepository } from "../DB/Repositories";

const productRepo = new ProductRepository()
const categoryRepo = new CategoryRepository()
const subCategoryRepo = new SubCategoryRepository()
const userRepo = new UserRepository()
const brandRepo = new BrandRepository()

const thresholdDate = new Date(Date.now() - 1 * 60 * 1000);
const reposToClean = [
  { name: 'products', repo: productRepo },
  { name: 'categories', repo: categoryRepo },
  { name: 'subCategories', repo: subCategoryRepo },
  { name: 'users', repo: userRepo },
  { name: 'brands', repo: brandRepo },
];


cron.schedule('0 * * * *', async () => {

  for (const { name, repo } of reposToClean) {
    try {
      const result = await repo.deleteMany({
        filters: { deletedAt: { $lt: thresholdDate } }
      });

      console.log(`[CRON] Deleted ${result?.deletedCount} ${name} older than 48 hours`);
    } catch (error) {
      console.error(`[CRON] Error deleting ${name}:`, error);
    }
  }
});