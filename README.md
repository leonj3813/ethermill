# Ethermill
> Server to provide an easy interface for creating Ethereum tokens. Uses Web3.js to interface with MetaMask to create a new token.

Project using Django to provide a simple way to create Etherem tokens. Uses Javascript library Web3.js to interface with MetaMask and create a new Ethereum token. Currently supports ERC20 tokens.

## Localhost usage
The Django project can be run with
```python
 pip install -r requirements.txt
 python manage.py runserver
 ```
 This serves the application at localhost:8000. MetaMask must be installed in the browser for most of the features to work.

### Docker
The project also includes a docker-compose file that can be used to set up the application behind a Nginx server. Running
```shell
docker-compose up
```
will serve the application.

Nginx is setup to only work with https. New https certificates will have to be loaded using letsencrypt. Also the file ethermill_nginx.conf needs to have the field 'server_name' set to the domain name.

Also Nginx is setup to use a production settings file instead of the local settings file. Make a new file called 'production.py' in textprocessor/setting and use local.py as a template. Set DEBUG=False, ALLOWED_HOSTS should be the domain name (or keep localhost), and a new SECRET_KEY value should be chosen.

## Usage
The about page describes what an Ethereum token is and detailed instructions on how to create one.
