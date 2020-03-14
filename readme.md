## Utopia Online Airline Reservation API

This is a microservice API apart of the utopia airline reservation system. This service handles requests from average users for booking and canceling itineraries.

### Deploying

This service uses Node JS with the "express" dependency for HTTP request handling. The dependency "config" is used for for managing profiles.

See the documentation here for config:

<https://www.npmjs.com/package/config>

This app depends on the config file for the database credentials, so you will have to add your database credentials using config.  
You will need to create a config folder if it does not exist, and add three profiles:

- default.yaml
- development.yaml
- production.yaml

The default.yaml file can be empty, but the other profiles cannot. The structure for the profile is below:

```
{
  "server": {
    "port": 80,
    "dbConfig": {
      "host": "localhost",
      "user": "root",
      "password": "password",
      "database": "databasename",
      "multipleStatements": false
    },

    "application": {
      //this is an optional value, if no value is provided then no sales tax is applied.
      "salesTax": 0.065
    },
    "jwt": {
      "secret": "secret"
    }
  }
}
```

This information can be broken up between the default profile and the other profiles. So you may put port and sailTax in the default profile, and dbConfig in the development and production profiles.

#### Running with a Profile

To run the application, you first have to create an environment variable called NODE_ENV, and set its value equal to the profile name minus the extention.

Example:

```
export NODE_ENV=production
node my-app.js
```
