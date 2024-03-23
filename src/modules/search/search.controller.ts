import { NextFunction, Request, Response } from "express";
import { async_ } from "../../interfaces/middleware/async.middleware";
import { sequelize } from "../../database";
import StatusCodes from "http-status-codes";
import Event from "../event/event.model";
import { Op } from "sequelize";

export const search = async_(
  async (req: Request, res: Response, next: NextFunction) => {
    const { q } = req.query;

    // let query = `SELECT e.id,e.location,e.date,e.time,e.likes_count,`;
    // query += `ts_rank(search, query) AS rank `;
    // query += `FROM events e, websearch_to_tsquery('english', :query) AS query `;
    // query += `WHERE search @@ query `;
    // query += `ORDER BY rank DESC;`;

    // const events = await sequelize.query(query, {
    //   replacements: { query: q },
    //   model: Event,
    //   benchmark: true,
    //   logging: console.log,
    // });

    const events = await Event.findAll({
      where: {
        search: {
          [Op.match]: sequelize.fn("websearch_to_tsquery", "english", q),
        },
      },
      attributes: ["id", "location", "date", "time", "likes_count",
      [sequelize.literal(`ts_rank(search, websearch_to_tsquery('english', :query))`), "rank"]
    ],
      order: sequelize.literal(
        "ts_rank(search, websearch_to_tsquery('english', :query)) DESC",
      ),
      replacements: { query: q },
      benchmark: true,
      logging: true,
    });

    return res.status(StatusCodes.OK).json({ success: true, data: events });
  },
);
