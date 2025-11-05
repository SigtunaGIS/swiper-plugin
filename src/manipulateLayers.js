import stripJSONComments from './utils/stripjsoncomments';

const ManipulateLayers = function ManipulateLayers(viewer, origoConfig) {
  const _viewer = viewer;
  const _origoConfig = origoConfig;

  function parseLayers(data) {
    const swiperLayers = data.layers.filter(elem => elem.isSwiperLayer);
    // creating the cloned version of the swiper layers
    swiperLayers.forEach(layer => {
      layer.name += '__swiper';
      layer.visible = false;
      layer.group = 'none';

      if (layer.type === 'GROUP') {
        layer.layers.forEach(innerLayer => {
          innerLayer.name += '__swiper';
          innerLayer.visible = false;
        });
      }
    });

    _viewer.addLayers(swiperLayers);

    return swiperLayers;
  }

  function createSwiperLayers() {
    // If it's a string, treat as URL. If it's an object (json), use it directly.
    if (typeof _origoConfig === 'string') {
      let url = _origoConfig;
      if (window.location.hash) {
        const urlParams = viewer.permalink.parsePermalink(window.location.href);
        if (urlParams.map) {
          url = `${urlParams.map}.json`;
        }
      }
      const searchurlParams = new URLSearchParams(window.location.search);
      if (searchurlParams.has('mapStateId')) {
        url = (location.origin).concat(location.pathname).concat(_origoConfig);
      }

      return fetch(url, {
        dataType: 'json' 
      })
      .then(res => res.text())
      .then((bodyAsJson) => {
        const stripped = stripJSONComments(bodyAsJson);
        let data;
        try {
          data = JSON.parse(stripped);
        } catch (e) {
          const index = parseInt(e.message.split(' ').pop(), 10);
          if (index) {
            const row = stripped.substring(0, index).match(/^/gm).length;
            throw Error(`${e.message}\non row : ${row}\nSomewhere around:\n${bodyAsJson.substring(index - 100, index + 100)}`);
          } else {
            throw e;
          }
        }
        return parseLayers(data);
      });
    } else if (typeof _origoConfig === 'object') {
      // Use JSON object directly
      return Promise.resolve(parseLayers(_origoConfig));
    } else {
      return Promise.reject(new Error('Invalid origoConfig provided to ManipulateLayers.'));
    }
  }

  return createSwiperLayers();
};

export default ManipulateLayers;