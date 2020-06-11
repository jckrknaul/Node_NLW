import express from 'express';

import PointsController from './controllers/PointsController';
import ItemsController from './controllers/ItemsControllers';

const routes = express.Router();
const pointsController = new PointsController();
const itemsController = new ItemsController();

routes.get('/items', itemsController.index);

routes.post('/points', pointsController.Create);
routes.get('/points', pointsController.Index);
routes.get('/points/:id', pointsController.Show);

export default routes;