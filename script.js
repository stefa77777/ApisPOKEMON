// Referencias al DOM
const grid = document.getElementById('pokemon-grid');
const mensajeCargando = document.getElementById('cargando');
const input = document.getElementById('campoBusqueda');
const boton = document.getElementById('botonBuscar');

let todosLosPokemones = []; 

// ==========================================
// 1. FUNCIONES DE LOCALSTORAGE (FAVORITOS)
// ==========================================
function obtenerFavoritosGuardados() {
  const favs = localStorage.getItem('pokemonesFavoritos');
  return favs ? JSON.parse(favs) : [];
}

function guardarFavoritos(lista) {
  localStorage.setItem('pokemonesFavoritos', JSON.stringify(lista));
}

function toggleFavorito(pokemon) {
  let favoritos = obtenerFavoritosGuardados();
  const existe = favoritos.some(fav => fav.id === pokemon.id);

  if (existe) {
    favoritos = favoritos.filter(fav => fav.id !== pokemon.id);
  } else {
    favoritos.push({
      id: pokemon.id,
      name: pokemon.name,
      sprites: pokemon.sprites,
      stats: pokemon.stats
    });
  }

  guardarFavoritos(favoritos);
}

// ==========================================
// 2. PETICIÓN A LA API
// ==========================================
async function obtenerTodosLosPokemones() {
  try {
    const limite = 151; // Primeros 151 Pokémon
    const promesas = [];

    for (let i = 1; i <= limite; i++) {
      promesas.push(fetch(`https://pokeapi.co/api/v2/pokemon/${i}`).then(res => res.json()));
    }

    todosLosPokemones = await Promise.all(promesas);

    if (mensajeCargando) mensajeCargando.style.display = 'none';
    mostrarPokemones(todosLosPokemones);

  } catch (error) {
    console.error('Error al cargar Pokémon:', error);
    if (mensajeCargando) mensajeCargando.textContent = 'Ocurrió un error al cargar la Pokédex.';
    if (errorElement) errorElement.textContent = 'Ocurrió un error al cargar la Pokédex.';
  }
}

// ==========================================
// 3. MOSTRAR TARJETAS EN EL DOM
// ==========================================
function mostrarPokemones(lista) {
  grid.innerHTML = '';

  if (lista.length === 0) {
    grid.innerHTML = '<p style="color: white; grid-column: 1/-1; text-align: center;">No se encontraron Pokémon.</p>';
    return;
  }

  const favoritosGuardados = obtenerFavoritosGuardados();

  lista.forEach(pokemon => {
    const tarjeta = document.createElement('div');
    tarjeta.classList.add('card');

    const idSpan = document.createElement('span');
    idSpan.classList.add('id');
    idSpan.textContent = `#${String(pokemon.id).padStart(3, '0')}`;

    const imagen = document.createElement('img');
    imagen.src = pokemon.sprites?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;
    imagen.alt = pokemon.name;
    imagen.loading = 'lazy';

    const nombre = document.createElement('p');
    nombre.classList.add('nombre');
    nombre.textContent = pokemon.name.toUpperCase();

    // Stats
    const statAtaque = pokemon.stats.find(s => s.stat.name === 'attack')?.base_stat || 0;
    const statDefensa = pokemon.stats.find(s => s.stat.name === 'defense')?.base_stat || 0;

    const ataque = document.createElement('p');
    ataque.classList.add('ataque');
    ataque.textContent = `Ataque: ${statAtaque}`;

    const defensa = document.createElement('p');
    defensa.classList.add('defensa');
    defensa.textContent = `Defensa: ${statDefensa}`;

    // Botón Favorito
    const esFavorito = favoritosGuardados.some(fav => fav.id === pokemon.id);
    const botonFavorito = document.createElement('button');
    botonFavorito.classList.add('btn-favorito');
    if (esFavorito) botonFavorito.classList.add('activo');
    botonFavorito.textContent = esFavorito ? '★ En favoritos' : '☆ Agregar a favoritos';

    botonFavorito.addEventListener('click', () => {
        toggleFavorito(pokemon);
        const nuevoEstado = botonFavorito.classList.toggle('activo');
        botonFavorito.textContent = nuevoEstado ? '★ En favoritos' : '☆ Agregar a favoritos';
    });

    // Botón Eliminar
    const botonEliminar = document.createElement('button');
    botonEliminar.classList.add('btn-eliminar');
    botonEliminar.textContent = 'Eliminar';

    botonEliminar.addEventListener('click', () => {
        tarjeta.remove();
    });

    tarjeta.append(idSpan, imagen, nombre, ataque, defensa, botonFavorito, botonEliminar);
    grid.appendChild(tarjeta);
  });
}

// ==========================================
// 4. BÚSQUEDA Y EVENTOS
// ==========================================
function buscarEnAPI() {
  const termino = input.value.trim().toLowerCase();

  const filtrados = todosLosPokemones.filter(pokemon => 
    pokemon.name.toLowerCase().includes(termino) || 
    pokemon.id.toString() === termino
  );

  mostrarPokemones(filtrados);
}

// Escuchar eventos si existen los elementos
if (input) input.addEventListener('input', buscarEnAPI);
if (boton) boton.addEventListener('click', buscarEnAPI);

// Iniciar la Pokédex
obtenerTodosLosPokemones();