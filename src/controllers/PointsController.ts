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

    const serialezedPoints = points.map(point => {
      return {
        ...point,
        image_url: `http://192.168.100.6:3333/uploads/${point.image}`
      }
    })  

    console.log(serialezedPoints);
    return response.json(serialezedPoints);
  }

  async Show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex('points').where('id', id).first();

    if (!point) {
      return response.status(400).json({message: 'Point not found'});
    }

    const serialezedPoints = {
      ...point,
      image_url: `http://192.168.100.6:3333/uploads/${point.image}`
    };
    
    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.title');

    return response.json({point: serialezedPoints, items});
  }

  async Create(request: Request, response: Response){
    const { name, email, whatsapp, latitude, longitude, city, uf, items } = request.body;

    const transaction = await knex.transaction();
  
    const point = { image: request.file.filename, 
      name, email, whatsapp, latitude, longitude, city, uf };

    const insertedIDs = await transaction('points').insert(point);
    const pointID = insertedIDs[0];

    const pointItems = items
      .split(',')
      .map((item: string) => Number(item.trim()))
      .map((item_id: Number) => {
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