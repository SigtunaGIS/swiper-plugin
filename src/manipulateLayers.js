import stripJSONComments from './utils/stripjsoncomments';

const ManipulateLayers = function ManipulateLayers(viewer, origoPath) {
  const _viewer = viewer;
  const _origoPath = origoPath;

  function createSwiperLayers() {
    let url = _origoPath;
    if (window.location.hash) {
      const urlParams = viewer.permalink.parsePermalink(window.location.href);
      if (urlParams.map) {
        url = `${urlParams.map}.json`;
      }
    } 
    const searchurlParams = new URLSearchParams(window.location.search);
    if (searchurlParams.has('mapStateId')) {
      const fullUrl = new URL(_origoPath, location.origin + location.pathname);
      fullUrl.search = searchurlParams.toString();
      url = fullUrl.href;
    } 

    return fetch(url, {
      dataType: 'json' 
    })
    // res.json() does not allow comments in json. 
    // Read out body as string and parse "manually"
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
          })
        }
      });

      _viewer.addLayers(swiperLayers)
 
      return swiperLayers;
    });
  }

  return createSwiperLayers();
};

export default ManipulateLayers;
