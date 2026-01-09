# Sistema de Escala IASD

![Logo IASD](public/logo-iasd.png)

![Login Preview](public/login-preview.png)

## Sobre o Projeto

O **Sistema de Escala IASD** é uma aplicação Web Progressiva (PWA) desenvolvida para facilitar a gestão de escalas dos ministérios da Igreja Adventista do Sétimo Dia. O sistema permite que membros marquem sua disponibilidade e que líderes organizem as escalas de forma visual e eficiente.

## Funcionalidades Principais

### Para Membros
- **Marcação de Disponibilidade**: Calendário interativo para selecionar os dias livres no mês.
- **Visualização de Escalas**: Acesso rápido às datas em que foi escalado.
- **Painel Pessoal**: Visualização clara de status e próximos compromissos.

### Para Líderes
- **Gestão de Equipes**: Controle total sobre os membros de cada ministério (Música, Sonoplastia, Diáconos, etc.).
- **Criação de Escalas**: Interface intuitiva para escalar membros baseada na disponibilidade informada.
- **Personalização**: Opção de adicionar capa personalizada para o ministério.

## Tecnologias Utilizadas

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **Estilização**: Tailwind CSS 3
- **Ícones**: Lucide React
- **PWA**: Vite Plugin PWA (Instalável em Mobile/Desktop)
- **Gerenciamento de Estado**: React Context API
- **Datas**: Date-fns

## Como Rodar o Projeto

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/escalaiasd.git
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse no navegador:
`http://localhost:5173`

## Deploy

O projeto está configurado para deploy na Vercel. Certifique-se de usar as configurações padrão do Vite.

## Licença

Este projeto é de uso interno para gestão de ministérios.
