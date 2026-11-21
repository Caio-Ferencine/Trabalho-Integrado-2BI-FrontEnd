# Front-end Angular - Loja

Parte do trabalho integrado de Lucas Eduardo da Cruz e Caio Henrique Ferencine.

1. Inicie a API conforme o [README principal](../README.md).
2. Instale Node.js 22.12+ da linha 22 ou Node.js 24.
3. Neste diretório, execute `npm ci` e `npm start`.
4. Abra http://localhost:4200.
5. No perfil demo, entre com `admin@loja.local` e `Admin@12345`.

`npm run build` gera os arquivos de produção em `dist/loja/browser`. O servidor de publicação precisa devolver `index.html` para rotas do Angular. A API é configurada em `src/environments/environment.ts`; CORS é configurado no back-end.

As páginas ficam em `src/app/pages`; os serviços HTTP, guard, interceptor e sessão ficam em `src/app/core`; o menu e a tabela compartilhada ficam em `src/app/shared`. Os componentes acessam a API através de serviços. Não há mock de produtos ou categorias no front-end.

Funcionalidades: login, logout, rotas protegidas, CRUD de produtos, CRUD de categorias, seletor de categoria, consulta por categoria no path, filtros de nome/cor/preço, confirmação de exclusão e feedback de sucesso/erro. A interface se adapta a telas menores, com rolagem horizontal da tabela quando necessária.
