import { writable } from 'svelte/store';

export type currentState = {
	timeTablerId: string;
	workerId: string;
};

export const stateStore = writable<currentState>({
	timeTablerId: '',
	workerId: ''
});
