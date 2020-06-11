import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {

  async Index(request: Request, response: Response) {
    const { city, uf, items } = request.query;
  
    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()));

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*');

    return response.json(points);
  }

  async Show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex('points').where('id', id).first();

    if (!point) {
      return response.status(400).json({message: 'Point not found'});
    }

    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.title');

    return response.json({point, items});
  }

  async Create(request: Request, response: Response){
    const { name, email, whatsapp, latitude, longitude, city, uf, items } = request.body;

    const transaction = await knex.transaction();
  
    const point = { image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60', 
      name, email, whatsapp, latitude, longitude, city, uf };

    const insertedIDs = await transaction('points').insert(point);
    const pointID = insertedIDs[0];

    const pointItems = items.map((item_id: Number) => {
      return {
        item_id,
        point_id: pointID
      }
    });
  
    await transaction('point_items').insert(pointItems);
  
    await transaction.commit();

    return response.json({
      id: pointID,
      ...point,
    });
  }

}

export default PointsController;