## Utopia Online Airline Reservation API
This is a microservice API apart of the utopia airline reservation system. This service handles requests from average users for booking and canceling itineraries.

### Deploying
This service uses Node JS with the "express" dependency for HTTP request handling. The dependency "config" is used for for managing profiles.

See the documentation here for config:

<https://www.npmjs.com/package/config>

This app depends on the config file for the database credentials, so you will have to add your database credentials using config.  
You will need to create a config folder if it does not exist, and add three profiles:

* default.yaml
* development.yaml
* production.yaml

The default.yaml file can be empty, but the other profiles cannot. The structure for the profile is below:

```
---
dbConfig:
  host: ""
  user: ""
  password: ""
  database: ""
```

