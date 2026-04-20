# Sending Toner Status

Sistema completo para monitoramento de impressoras via SNMP, com backend + frontend, controle de toner, snapshots de status e alertas automáticos.

---

## 🚀 Visão geral

O sistema realiza:

- cadastro de impressoras e grupos
- leitura de níveis de toner via SNMP
- detecção automática de **serialNumber**
- cálculo de percentual por cor
- armazenamento de snapshots de status
- dashboard web com atualização automática
- alertas por e-mail com regras inteligentes

---

## 🧱 Arquitetura

```text
/backend
/frontend