# ROYGBIV Analytics Server

This is ready-to-ship analytics server for ROYGBIV projects. The URL of analytics
server may be configuder via settings GUI, under Analytics folder.

## Usage

### Creating the table

Analytics server depends works on PostgreSQL databases. A PostgreSQL table
should be created:

```SQL
CREATE TABLE sofa_analytics (
    id text PRIMARY KEY,
    total_load_time real DEFAULT '0'::real,
    shader_load_time real DEFAULT '0'::real,
    application_json_load_time real DEFAULT '0'::real,
    mode_switch_time real DEFAULT '0'::real,
    first_render_time real DEFAULT '0'::real,
    is_mobile character(1),
    is_ios character(1),
    highp_precision_supported character(1),
    browser text,
    time_spent real DEFAULT '0'::real,
    avg_fps real DEFAULT '0'::real,
    date timestamp with time zone
);

CREATE UNIQUE INDEX sofa_analytics_pkey ON sofa_analytics(id text_ops);
```

### Running the Server

Use `node server` to start the server after installing the deps:
* express
* body-parser
* pg

These environment variables may be injected:

* DATABASE_URL
* TABLE_NAME
* SECRET_KEY

### Getting Analytics From Server

`/analytics` GET endpoint may be used to get analytics records from the database.
These query parameters should be used to invoke this endpoint:

* page (>= 1)
* per_page (>= 0)
* secret (for security, same as SECRET_KEY env variable)

An example response of this endpoint

```json
{
  "onlineClientLen":5,
  "result": [
    {
      "id":"d2c6af5f-a36a-4f5a-8505-c5cd10f3d796",
      "total_load_time":0,
      "shader_load_time":0,
      "application_json_load_time":0,
      "mode_switch_time":0,
      "first_render_time":881.87,
      "is_mobile":"F",
      "is_ios":"F",
      "highp_precision_supported":"T",
      "browser":"Chrome",
      "time_spent":640.85364,
      "avg_fps":58,
      "date":"2020-12-19T15:12:28.744Z"
    }
  ]
}
```
