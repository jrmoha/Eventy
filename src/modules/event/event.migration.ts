import { sequelize } from "../../database/index";
import logger from "../../utils/logger";

const alter_query = `ALTER TABLE events ADD COLUMN IF NOT EXISTS search TSVECTOR;`;
const function_query = `
CREATE OR REPLACE FUNCTION update_events_search_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search :=
        setweight(to_tsvector('english', COALESCE(NEW.location, '')), 'A') || ' ' ||
        setweight(to_tsvector('english', COALESCE((
            SELECT string_agg(category, ', ') 
            FROM event_categories 
            WHERE event_id = NEW.id), '')), 'A') || ' ' ||
        setweight(to_tsvector('english', COALESCE((
            SELECT string_agg(question || ': ' || answer, ', ') 
            FROM event_faq 
            WHERE event_id = NEW.id), '')), 'D') || ' ' ||
        setweight(to_tsvector('english', COALESCE((
            SELECT string_agg(description, ', ') 
            FROM event_agenda 
            WHERE event_id = NEW.id), '')), 'D') || ' ' ||
        setweight(to_tsvector('english', COALESCE((
            SELECT p.content 
            FROM posts p
            WHERE p.id = NEW.id), '')), 'A') || ' ' ||
        setweight(to_tsvector('english', COALESCE((
            SELECT string_agg(username || ', ' ||full_name || ', ' || email || ', ' || phone_number, ', ') 
            FROM (
                SELECT username, first_name || ' ' || last_name AS full_name, email, phone_number
                FROM person
                WHERE id = (SELECT organizer_id FROM posts WHERE id = NEW.id)
                ) AS subquery), '')), 'A');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

`;
const find_trigger_query = `SELECT 1 FROM pg_trigger WHERE tgname = 'events_update_search_column_trigger'`;
const trigger_query = `CREATE TRIGGER events_update_search_column_trigger
BEFORE INSERT OR UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION update_search_column();`;
const index_query = `CREATE INDEX IF NOT EXISTS search_idx ON events USING GIN(search);`;

(async () => {
  try {
    await sequelize.query(alter_query,{logging:false});
    await sequelize.query(function_query,{logging:false});
    const [trigger] = await sequelize.query(find_trigger_query,{logging:false});
    if (!trigger.length) await sequelize.query(trigger_query,{logging:false});
    await sequelize.query(index_query,{logging:false});

    logger.info("Migration successful!");
  } catch (error) {
    logger.error(error);
  }
})();
