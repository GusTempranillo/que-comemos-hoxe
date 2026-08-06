# Servidor de IA (sen n8n)

Servidor mínimo, dun só ficheiro (`servidor.js`), que expón `POST /ia/axuda`
chamando directamente a unha API de IA compatible con OpenAI (Moonshot/Kimi
por defecto). Pensado para correr no mesmo VPS que xa tes para n8n/Supabase,
pero como proceso independente — non le nin escribe en Supabase, non depende
de n8n para nada.

## Por que existe

`POST /ia/axuda` en n8n non responde en produción (ver
`DOCS/BACKEND_N8N_STATUS.md` no repositorio principal). Este servidor é unha
alternativa: mesma forma de petición/resposta que xa asume o frontend
(`js/api.js`, `js/vistas/detalle.js`), pero sen pasar por n8n.

## Instalar e arrancar

```bash
cd servidor-ia
npm install
cp .env.example .env
# edita .env: IA_ACCESS_TOKEN, AI_API_KEY (a túa clave de Moonshot/Kimi ou outro provedor)
npm start
```

Para deixalo correndo de fondo no VPS, usa `pm2` (`pm2 start servidor.js --name qch-ia`)
ou un servizo `systemd` — o de menos é o mesmo que xa uses para outros procesos node no VPS.

## Expoñelo en HTTPS (Nginx)

Igual que xa tes para n8n, un bloque `server` de Nginx que faga de proxy inverso
cara a `localhost:3001` (ou o `PORT` que puxeses en `.env`). Exemplo mínimo:

```nginx
server {
    listen 443 ssl;
    server_name ia.osdomino.eu;   # cámbiao polo teu dominio/subdominio

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
    }
}
```

**Importante sobre CORS**: este servidor xa manda a cabeceira
`Access-Control-Allow-Origin` el mesmo (configurable en `ORIXES_PERMITIDAS`
no `.env`). Non deixes que Nginx tamén a engada — é o mesmo problema de
cabeceira CORS duplicada que xa se atopou e arranxou en n8n
(`DOCS/BACKEND_N8N_STATUS.md`, "CORS funciona").

## Conectalo co frontend

Isto **aínda non está feito**: `js/api.js` no repositorio principal segue a
chamar á URL base configurada para n8n. Para usar este servidor en vez dese
endpoint concreto faría falta un pequeno cambio no frontend (unha URL base
separada só para `/ia/axuda`, ou trocar por completo a URL de n8n por esta
se decides que este servidor substitúe ese anaco). Dio cando teñas isto
despregado e a URL real, e faise ese cambio.

## Que fai e que non fai

- Fai: `mellorar`, `nutricion` (axusta a estimación local por método de
  cociñado se lla mandas en `contexto.estimacionLocal`), `adaptar`,
  `redactar`, `sobras`.
- Non fai (aínda): `lista_compra` e `recomendar` — precisan contexto de toda
  a semana/receitario, non dunha soa receita, e o contrato actual do
  frontend non manda iso. Habería que ampliar a petición se se queren.
- Non valida sesións de n8n: usa un segredo compartido propio
  (`IA_ACCESS_TOKEN`), independente do login de n8n.
