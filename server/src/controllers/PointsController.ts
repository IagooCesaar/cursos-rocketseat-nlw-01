import {Request, Response} from 'express'
import knex from '../database/connection'

class PointsController {
  async index(req: Request, res: Response) {
    const {
      city,
      uf, 
      items
    } = req.query;    

    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()));

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*')

    const serializedPoints = points.map(point => {
      return {
        ...point,
        image_url: `http://192.168.100.100:3333/uploads/${point.image}`
      }
    })

    return res.status(200).json(serializedPoints)


  }
  async show(req: Request, res: Response) {
    const {id} = req.params;

    const point = await knex('points')
      .where('id', id)
      .first();
    if (!point) {
      return res.status(400).json({message: 'Point not found!'})
    }
    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.id', 'items.title')

    const serializedPoint = {
      ...point,
      image_url: `http://192.168.100.100:3333/uploads/${point.image}`
    }

    return res.status(200).json({...serializedPoint, items})
  }

  async create(req: Request, res: Response) {
    const trx = await knex.transaction();

    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
    } = req.body;

    const point = {
      name,
      image: req.file.filename,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf
    };

    const pointId = await trx('points').insert(point);

    const pointItems = items
      .split(',')
      .map((item: string) => Number(item.trim()) )
      .map((item_id: number) => {
      return {
        point_id: pointId[0],
        item_id
      }
    });

    await trx('point_items').insert(pointItems);

    trx.commit();

    return res.status(201).json({
      id: pointId[0],
      ...point
    })
  }
}

export default PointsController;