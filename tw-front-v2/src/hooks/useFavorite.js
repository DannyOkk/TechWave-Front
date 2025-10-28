import { useEffect, useState, useCallback } from 'react';
import favoriteService, { getGuestFavorites } from '../services/favoriteService';

/**
 * Hook para gestionar favoritos (guest + autenticado) sin modificar UI existente.
 * Retorna lista normalizada:
 *  - Guest: array de IDs (numbers)
 *  - Auth: array de products { id, nombre, precio }
 */
export function useFavorites() {
	const [list, setList] = useState([]); // guest: number[], auth: product[]
	const [count, setCount] = useState(0);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const isAuth = !!localStorage.getItem('access_token');

	const load = useCallback(async () => {
		setLoading(true); setError(null);
		try {
			const data = await favoriteService.list();
			setList(data);
			if (isAuth) setCount(Array.isArray(data) ? data.length : 0);
			else setCount(Array.isArray(data) ? data.length : 0);
		} catch (e) {
			setError(e);
		} finally { setLoading(false); }
	}, [isAuth]);

	useEffect(() => { load(); }, [load]);

	useEffect(() => {
		const onFav = () => {
			// Estado rápido desde local si guest
			if (!isAuth) {
				const ids = getGuestFavorites();
				setList(ids);
				setCount(ids.length);
			} else {
				load();
			}
		};
		window.addEventListener('favorites-changed', onFav);
		return () => window.removeEventListener('favorites-changed', onFav);
	}, [isAuth, load]);

	const isFavorite = useCallback((productId) => {
		if (isAuth) return list.some(p => Number(p.id) === Number(productId));
		return list.includes(Number(productId));
	}, [list, isAuth]);

	const toggle = useCallback(async (productId) => {
		try {
			// Optimistic UI
			if (isAuth) {
				const prev = list;
				const exists = prev.some(p => Number(p.id) === Number(productId));
				if (exists) {
					setList(prev.filter(p => Number(p.id) !== Number(productId)));
				} else {
					setList(prev.concat({ id: Number(productId) }));
				}
				setCount(c => exists ? c - 1 : c + 1);
				await favoriteService.toggle(productId);
			} else {
				const prev = list;
				const exists = prev.includes(Number(productId));
				if (exists) setList(prev.filter(id => Number(id) !== Number(productId)));
				else setList(prev.concat(Number(productId)));
				setCount(c => exists ? c - 1 : c + 1);
				await favoriteService.toggle(productId);
			}
		} catch (e) {
			// fallback reload
			load();
		}
	}, [list, isAuth, load]);

	return { favorites: list, count, loading, error, isAuth, isFavorite, toggle, reload: load };
}

export default useFavorites;

