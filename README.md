# Unicooper POC

Site institucional com CMS simples usando HTML, CSS, JavaScript puro, Firebase Hosting e Firestore.

## Arquivos principais

- `index.html`: Home
- `institucional.html`: Quem somos, missão, visão e valores
- `vantagens.html`: Benefícios em cards
- `convenios.html`: Convênios ativos com filtro por categoria
- `calendario.html`: Calendário de repasse
- `contato.html`: Canais oficiais
- `admin.html`: CMS simples sem autenticação
- `assets/firebase.js`: Configuração do Firebase e exports do Firestore
- `assets/script.js`: Renderização pública
- `assets/admin.js`: Leitura e escrita do CMS
- `assets/style.css`: Estilos compartilhados

## Como rodar localmente

Por usar ES Modules, abra com um servidor local.

Opção com Firebase CLI:

```bash
firebase emulators:start --only hosting
```

Opção com Python, dentro da pasta do projeto:

```bash
python -m http.server 8080
```

Acesse:

```text
http://localhost:8080
http://localhost:8080/admin.html
```

## Como criar o projeto Firebase

1. Acesse `https://console.firebase.google.com`.
2. Crie ou selecione o projeto `unicooper---poc`.
3. Em Build, ative o Firestore Database.
4. Crie o banco em modo de teste para a POC.
5. Em Project settings, confira as credenciais Web.
6. Se necessário, atualize `assets/firebase.js` com o `firebaseConfig`.

## Regras temporárias do Firestore para POC

Use apenas durante a prova de conceito:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

Antes de produção, adicione Firebase Auth e regras restritivas para escrita no CMS.

## Como subir no Firebase Hosting

Instale e autentique a Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
```

Inicialize Hosting se necessário:

```bash
firebase init hosting
```

Configuração recomendada:

- Public directory: `.`
- Configure as single-page app: `No`
- Set up automatic builds and deploys: `No`

Deploy:

```bash
firebase deploy --only hosting
```

## Observações

- O CMS não tem autenticação por enquanto.
- Os dados iniciais são criados automaticamente quando as coleções/documentos estão vazios.
- O site público carrega apenas convênios ativos.
- O link do portal do cooperado também é exibido em texto para reduzir risco de phishing.
