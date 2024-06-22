# Imersão Full Stack & FullCycle - Sistema de Venda de Ingressos

## Descrição

Repositório da API feita com Nest.js (Reserva de Ingressos)

## Rodar a aplicação

Abra o projeto usando VsCode DevContainers como definido em .devcontainer/devcontainer.json.
Quando tudo estiver carregado, executar no terminal:

```
// instalar as dependências:
npm install

// executar a migração do parceiro:
npm run migrate

//[opcional] Carregar o banco com dados de exemplo:
npm run start:dev-fixture

// Executar o partner na porta 3000
npm run start:dev

```

Espere os logs verdinhos do Nest para verificar se deu certo.

* Acessar o arquivo './partner1.http' para criar / listar os eventos, reservar lugares e comprar ingressos do parceiro.

### Para Windows 

Lembrar de instalar o WSL2 e Docker. Vejo o vídeo: [https://www.youtube.com/watch?v=btCf40ax0WU](https://www.youtube.com/watch?v=btCf40ax0WU) 

Siga o guia rápido de instalação: [https://github.com/codeedu/wsl2-docker-quickstart](https://github.com/codeedu/wsl2-docker-quickstart)