export * from './config';

export function onExit(callback: () => Promise<void>) {
    const done = [false];
    [`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach(
        (event) => process.on(event, async () => {
            try {
                if (!done[0]) {
                    await callback();
                    done[0] = true;
                }
            } catch (_) {};
        })
    );
}

export function escapeRegExp(input: string) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }