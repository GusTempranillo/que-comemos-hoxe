/* Cliente da API de n8n (ver DOCS/API_CONTRACT.md).
   A interface sempre garda e pinta primeiro. Este módulo só sincroniza por
   detrás, garda unha cola pequena para cando non hai rede e conserva unha
   caché dos catálogos para que a app siga sendo útil sen conexión. */
window.QCH = window.QCH || {};

QCH.api = (function () {
  const CLAVE_CONFIG = 'qch:api:v1';
  const CLAVE_CATALOGOS = 'qch:catalogos:v1';
  const CLAVE_PENDENTES = 'qch:api:pendentes:v1';
  const URL_PREDETERMINADA = 'https://n8n.xosemiguel.eu/webhook/qch';
  const enCurso = {};

  function ler(clave, porDefecto) {
    try {
      const gardado = localStorage.getItem(clave);
      return gardado ? JSON.parse(gardado) : porDefecto;
    } catch (e) { return porDefecto; }
  }

  function gardar(clave, valor) {
    try { localStorage.setItem(clave, JSON.stringify(valor)); } catch (e) { /* sen persistencia */ }
  }

  let config = ler(CLAVE_CONFIG, {});
  let pendentes = ler(CLAVE_PENDENTES, {});

  function gardarConfig() { gardar(CLAVE_CONFIG, config); }
  function gardarPendentes() { gardar(CLAVE_PENDENTES, pendentes); }

  function erroRede(erro) {
    if (erro && erro.codigo) return erro;
    return { codigo: 'rede', mensaxe: 'Non se puido contactar co servidor' };
  }

  function urlCompleta(ruta) {
    const base = config.baseUrl || URL_PREDETERMINADA;
    return base.replace(/\/$/, '') + ruta;
  }

  /* Fai unha chamada á API. Devolve sempre JSON ou un erro coa forma do
     contrato, incluso cando a rede falla antes de chegar a n8n. */
  function chamar(metodo, ruta, corpo, publica) {
    if (!config.baseUrl && !publica) {
      return Promise.reject({ codigo: 'sen_configurar', mensaxe: 'Non hai URL de n8n configurada' });
    }
    const opcions = { method: metodo, headers: { 'Content-Type': 'application/json' } };
    if (!publica && config.token) opcions.headers.Authorization = 'Bearer ' + config.token;
    if (corpo !== undefined) opcions.body = JSON.stringify(corpo);

    return fetch(urlCompleta(ruta), opcions).then(res => (
      res.json().catch(() => null).then(datos => {
        if (!res.ok) {
          return Promise.reject(datos && datos.erro ? datos : {
            codigo: 'erro_' + res.status,
            mensaxe: 'O servidor devolveu un erro inesperado'
          });
        }
        return datos;
      })
    )).catch(erro => Promise.reject(erroRede(erro)));
  }

  function listaValida(lista) {
    return Array.isArray(lista) && lista.every(elemento => elemento && typeof elemento.id === 'string');
  }

  function actualizarMapas() {
    QCH.mapaIngredientes = QCH.INGREDIENTES.reduce((mapa, ingrediente) => (mapa[ingrediente.id] = ingrediente, mapa), {});
    QCH.mapaReceitas = QCH.RECEITAS.reduce((mapa, receita) => (mapa[receita.id] = receita, mapa), {});
    QCH.mapaPersoas = QCH.PERSOAS.reduce((mapa, persoa) => (mapa[persoa.id] = persoa, mapa), {});
  }

  function aplicarCatalogos(catalogos) {
    if (!catalogos || typeof catalogos !== 'object') return false;
    let mudou = false;
    if (listaValida(catalogos.ingredientes)) { QCH.INGREDIENTES = catalogos.ingredientes; mudou = true; }
    if (listaValida(catalogos.receitas)) { QCH.RECEITAS = catalogos.receitas; mudou = true; }
    if (listaValida(catalogos.persoas)) { QCH.PERSOAS = catalogos.persoas; mudou = true; }
    if (mudou) actualizarMapas();
    return mudou;
  }

  function catalogosLocais() {
    return {
      receitas: QCH.RECEITAS,
      ingredientes: QCH.INGREDIENTES,
      persoas: QCH.PERSOAS
    };
  }

  function cargarCatalogosGardados() {
    aplicarCatalogos(ler(CLAVE_CATALOGOS, null));
  }

  function datosEstadoValidos(valor) {
    return valor && typeof valor === 'object' && !Array.isArray(valor);
  }

  function chamadaPara(recurso, valor) {
    if (recurso === 'semana') return chamar('PUT', '/semana', valor);
    if (recurso === 'neveira') return chamar('PUT', '/neveira', valor);
    if (recurso === 'cociñeiros') return chamar('PUT', '/cociñeiros', valor);
    return Promise.reject({ codigo: 'recurso_invalido', mensaxe: 'Recurso de sincronización descoñecido' });
  }

  /* Só se conserva a última versión completa de cada recurso: o contrato usa
     PUT completo e así non hai unha lista interminable de pequenos cambios. */
  function procesarRecurso(recurso) {
    if (enCurso[recurso] || !pendentes[recurso] || !config.token) return Promise.resolve();
    const valor = pendentes[recurso];
    delete pendentes[recurso];
    gardarPendentes();
    enCurso[recurso] = true;

    return chamadaPara(recurso, valor).catch(erro => {
      if (!pendentes[recurso]) pendentes[recurso] = valor;
      gardarPendentes();
      return Promise.reject(erro);
    }).finally(() => {
      enCurso[recurso] = false;
    }).then(() => procesarRecurso(recurso));
  }

  function sincronizar(recurso, valor) {
    if (!config.token || !datosEstadoValidos(valor)) return Promise.resolve({ pendente: false });
    pendentes[recurso] = valor;
    gardarPendentes();
    if (navigator.onLine === false) return Promise.resolve({ pendente: true });
    return procesarRecurso(recurso).then(() => ({ pendente: !!pendentes[recurso] })).catch(() => ({ pendente: true }));
  }

  function reintentarPendentes() {
    if (!config.token || navigator.onLine === false) return Promise.resolve();
    return Promise.all(['semana', 'neveira', 'cociñeiros'].map(recurso => procesarRecurso(recurso).catch(() => null)));
  }

  function prepararCasa() {
    return Promise.all([
      chamar('GET', '/receitas'),
      chamar('GET', '/ingredientes'),
      chamar('GET', '/persoas'),
      chamar('GET', '/semana'),
      chamar('GET', '/neveira'),
      chamar('GET', '/cociñeiros')
    ]).then(respostas => {
      const catalogos = { receitas: respostas[0], ingredientes: respostas[1], persoas: respostas[2] };
      if (!listaValida(catalogos.receitas) || !listaValida(catalogos.ingredientes) || !listaValida(catalogos.persoas) ||
          !datosEstadoValidos(respostas[3]) || !datosEstadoValidos(respostas[4]) || !datosEstadoValidos(respostas[5])) {
        return Promise.reject({ codigo: 'resposta_invalida', mensaxe: 'O servidor devolveu datos cun formato incorrecto' });
      }
      aplicarCatalogos(catalogos);
      gardar(CLAVE_CATALOGOS, catalogos);
      QCH.estado.set({ semana: respostas[3], neveira: respostas[4], cociñeiros: respostas[5] }, 'remoto');
      return reintentarPendentes();
    });
  }

  cargarCatalogosGardados();

  return {
    configurar(baseUrl) {
      config.baseUrl = (baseUrl || '').replace(/\/$/, '');
      gardarConfig();
    },
    estaConfigurada: () => !!config.baseUrl,
    estaAutenticada: () => !!config.token,
    baseUrl: () => config.baseUrl || URL_PREDETERMINADA,
    pendentes: () => Object.keys(pendentes),

    /* Autenticación e carga inicial da casa. O token introducido só se usa
       para obter a sesión; no navegador queda unicamente o token de sesión. */
    login(tokenAcceso) {
      return chamar('POST', '/auth/login', { token: tokenAcceso }).then(resp => {
        config.token = resp.token;
        config.caduca = resp.caduca;
        gardarConfig();
        return prepararCasa().then(() => resp).catch(erro => {
          /* A sesión é válida aínda que nese momento non se poida descargar a
             casa. Conservamos o modo local e tentaremos de novo ao volver a
             haber rede, en vez de bloquear a persoa que está a cociñar. */
          resp.aviso = (erro && erro.mensaxe) || 'A casa cargarase cando volva haber conexión';
          return resp;
        });
      });
    },
    logout() { config.token = null; config.caduca = null; gardarConfig(); },

    /* Catálogos de só lectura — contrato §4 */
    receitas: () => chamar('GET', '/receitas'),
    ingredientes: () => chamar('GET', '/ingredientes'),
    persoas: () => chamar('GET', '/persoas'),

    /* Estado planificable — contrato §5 */
    obterSemana: () => chamar('GET', '/semana'),
    gardarSemana: semana => chamar('PUT', '/semana', semana),
    obterNeveira: () => chamar('GET', '/neveira'),
    gardarNeveira: neveira => chamar('PUT', '/neveira', neveira),
    obterCociñeiros: () => chamar('GET', '/cociñeiros'),
    gardarCociñeiros: cociñeiros => chamar('PUT', '/cociñeiros', cociñeiros),
    sincronizar,
    reintentarPendentes,
    prepararCasa,

    /* Compartición — contrato §7. A lectura pública non leva sesión. */
    compartir: dia => chamar('POST', '/compartir', { dia }),
    menuPublico: token => chamar('GET', '/publico/' + encodeURIComponent(token), undefined, true),

    /* Axuda da IA — contrato §8. A IA nunca cambia unha receita por conta
       propia (COOKBOOK_MODEL.md §Papel da IA): isto só devolve unha
       proposta; decidir se se aplica é sempre cousa do cociñeiro. */
    axudaIA: (accion, receitaId, contexto) => chamar('POST', '/ia/axuda', {
      accion, receitaId, contexto: contexto || {}
    })
  };
})();
