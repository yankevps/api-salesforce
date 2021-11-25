# Executando em máquina local
É possível executar o projeto de duas formas, sendo a primeira rodando tudo via Docker(recomendável) e a segunda rodando a API separadamente.

## Primeira forma - via Docker
### Pré-requisitos
- Docker
- Docker Compose
- Porta 3333 disponível
### Executando o projeto
1. Instale as depêndecias
```
yarn install
```
2. Execute os containers
```
yarn up
```


Aguarde até o log aparecer:
```
api         | Server running at http://localhost:3333/api
```
## Segunda forma - Manualmente
Esta forma é mais indicada para quem quer continuar o desenvolvimento do projeto, pois nela é utilizado a biblioteca ts-node-dev que faz o reload da aplicação quando alterado o código fonte.
### Pré-requisitos
- Instância de banco de dados Postgres
- Instância de RabbitMq

*Obs: é possível criar ambas instâncias utilizando o docker-compose, conforme demonstrado nos passos 2 e 3 respectivamente*
### Primeiro passo
1. Configure o .env na raiz do projeto conforme o exemplo abaixo:
```
PORT=3333
JWT_SECRET=your_secret
JWT_EXPIRES_IN=1d
AMQP_RABBITMQ=amqp://admin:1@localhost
```
*Obs: na raiz do projeto contém um .env.example*

**AMQP_RABBITMQ**: variável de ambiente com o host e porta para o RabbitMq que iremos configurar no segundo passo.

**DB_***: variáveis de ambiente para o banco de dados Postgres que iremos configurar no terceiro passo.

### Segundo passo
Este projeto conta com um container de **RabbitMq** para que seja possível efetuar a atualização dos produtos vindos da API externa através de uma fila.

Para criar esse container, basta executar o comando:
```
docker-compose up -d rabbitmq
```
O Rabbitmq estará disponível em: http://localhost:15672

Usuário: admin

Senha: 1

### Quarto passo
1. Instale as depêndecias
```
yarn install
```
2. Execute o projeto
```
yarn dev
```
# Rodando os testes
Este projete contém testes **unitários** e de **integração**. Os testes unitários foram feitos principalmente nas services, onde encontra-se toda regra de negócio. Nos testes unitários foi utilizado **mock dos repositórios**, enquanto nos testes de integração, nos controllers, foi utilizado o banco de dados **SQLite em memória**.

1. Instale as depêndecias
```
yarn install
```
2. Execute os testes
```
yarn test --coverage
```