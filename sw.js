// imports

importScripts('js/sw-utils.js'); // este es otro archivo que nosotros vamos a ocupar en nuestro appshell

//

const STATIC_CACHE = 'static-v4';
const DYNAMIC_CACHE = 'dynamic-v2';
const INMUTABLE_CACHE = 'inmutable-v1';

const APP_SHELL = [
    // '/',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/ironman.jpg',
    'img/avatars/hulk.jpg',
    'img/avatars/spiderman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js',
    'js/sw-utils.js'

];

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
    'css/animate.css',
    'js/libs/jquery.js'
];

// ahora hay que hacer la parte de la instalación del Service Worker

self.addEventListener('install', e => {

    // Tenemos que almacenar en el Cache el appshell dynamic y el appshell inmutable
    // En sus respectivos lugares.
    // Creamos una promesa con referencia a cache
    const cacheStatic = caches.open(STATIC_CACHE).then(cache => cache.addAll(APP_SHELL)); //addAll pide una arreglo y ese es el appshell
    const cacheInmutable = caches.open(INMUTABLE_CACHE).then(cache => cache.addAll(APP_SHELL_INMUTABLE));
    // ya tengo dos promesas, las dos lineas anteriores

    e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
    // ya tengo el proceso de instalación
});

// Ahora hagamos un proceso para que cada vez que yo cambie el service Worker
// me borre los caches anteriores que ya no me van a servir, para eso:

self.addEventListener('activate', e => {
    // Lo que yo tengo que verificar es que si la versión del cache actual
    // que se encuentra en este service worker es la misma que el que se encuentra
    // activo, entonces yo no tengo que hacer nada, pero si hay alguna diferencia
    // entonces debo borrar el cache estático.

    const respuesta = caches.keys().then(keys => {

        keys.forEach(key => {

            if (key !== STATIC_CACHE && key.includes('static')) {
                return caches.delete(key);
            }

            if (key !== DYNAMIC_CACHE && key.includes('dynamic')) {
                return caches.delete(key);
            }

        });
    });

    e.waitUntil(respuesta);

});

// Cache con Network Fallback
// En caso de no ser encontrado en el cache, se va ir a la web a traer la 
// Información 

self.addEventListener('fetch', e => {

    // tengo que verificar en el cache si existe la request

    const respuesta = caches.match(e.request).then(res => {

        if (res) {

            return res;

        } else {

            return fetch(e.request).then(newRes => {

                return guardaCacheDinamico(DYNAMIC_CACHE, e.request, newRes);

            });

        }
    });

    e.respondWith(respuesta);
});