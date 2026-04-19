# Sending Toner Status

Backend para monitoramento de impressoras via SNMP, cálculo de nível de toner, geração de snapshots de status e envio de alertas por e-mail.

## Visão geral

O projeto faz:

- cadastro de impressoras em PostgreSQL
- leitura de níveis de toner via SNMP
- cálculo de percentual por cor
- snapshots de status para consumo futuro pelo frontend
- alerta por e-mail com duas regras:
  - **atenção**: toner em `10%` ou menos e acima de `2%`
  - **crítico**: toner em `2%` ou menos
- reset automático do estado de alerta quando o toner volta para `100%`

## Tecnologias

- Node.js
- TypeScript
- Fastify
- Prisma
- PostgreSQL
- Docker
- net-snmp
- Nodemailer

## Estrutura principal

```text
src/
  config/printers/         # JSONs de OIDs por fabricante/modelo
  controllers/             # controllers HTTP
  database/                # conexão Prisma
  jobs/                    # rotinas periódicas
  mail/                    # envio de e-mail e templates
  models/                  # modelagem interna
  routes/                  # rotas Fastify
  services/                # regras de negócio
  snmp/                    # sessão SNMP e leitura de impressoras
  types/                   # tipagens
  utils/                   # validações auxiliares
```

## Modelos de impressora suportados no momento

### HP
- HP E57540DN
- HP PRO4103FDW
- HP M428FDW
- HP M432FDN

### Samsung
- Samsung M4070FR
- Samsung M4020
- Samsung M4080FX

## Regras de alerta implementadas

O controle é feito por **impressora + cor do toner**.

### Alerta de atenção
Quando o nível estiver entre `3%` e `10%`:
- envia **um único e-mail**
- não repete até o toner voltar para `100%`

### Alerta crítico
Quando o nível estiver em `2%` ou menos:
- envia e-mail no primeiro nível crítico detectado
- volta a enviar apenas se o nível cair mais
  - exemplo: `2% -> 1% -> 0%`

### Reset
Quando o toner volta para `100%`:
- reseta o estado de alerta
- libera novo ciclo de notificações

## Banco de dados

O projeto utiliza PostgreSQL com Prisma.

Entidades principais:

- `Printers`
- `Group`
- `PrinterAlertState`
- `PrinterStatusSnapshot`

## Variáveis de ambiente

Crie um arquivo `.env` com os dados do seu ambiente:

```env
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/printers_db"

MAIL_HOST=seu_smtp
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=seu_usuario
MAIL_PASS=sua_senha
MAIL_FROM=alertas@seudominio.com
MAIL_TO=destinatario@seudominio.com
```

## Como rodar

### 1. Subir o PostgreSQL com Docker

```bash
docker compose up -d
```

### 2. Gerar cliente Prisma

```bash
npx prisma generate
```

### 3. Aplicar schema no banco

```bash
npx prisma migrate dev
```

ou, em ambiente de desenvolvimento rápido:

```bash
npx prisma db push
```

### 4. Subir o backend

```bash
npm run start
```

## Rotas atuais

### Impressoras
- `POST /printer`
- `GET /printer`
- `GET /printer/:id`
- `PUT /printer/:id`
- `DELETE /printer/:id`

### Status
- `GET /printer/status`

## Exemplo de cadastro de impressora

```json
{
  "name": "IMPRESSORA_EXEMPLO",
  "ip": "IP_DA_IMPRESSORA",
  "serialNumber": "SERIAL_OPCIONAL",
  "groupId": 1,
  "brand": "HP",
  "model": "HP E57540DN"
}
```

## Estado atual do projeto

No estado atual, o backend já está apto a:

- monitorar impressoras cadastradas
- consultar toner via SNMP
- gerar snapshots de status
- disparar alertas por e-mail
- servir dados para um futuro dashboard