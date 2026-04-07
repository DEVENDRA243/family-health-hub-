'use client';

import React from 'react';
import { MonitorCogIcon, MoonStarIcon, SunIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

const THEME_OPTIONS = [
	{
		icon: MonitorCogIcon,
		value: 'system',
	},
	{
		icon: SunIcon,
		value: 'light',
	},
	{
		icon: MoonStarIcon,
		value: 'dark',
	},
];

export function ToggleTheme() {
	const { theme, setTheme } = useTheme();

	const [isMounted, setIsMounted] = React.useState(false);

	React.useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) {
		return <div className="flex h-8 w-24" />;
	}

	return (
		<motion.div
			key={String(isMounted)}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.3 }}
			className="bg-muted/40 inline-flex items-center overflow-hidden rounded-md border border-border/50 p-1"
			role="radiogroup"
		>
			{THEME_OPTIONS.map((option) => (
				<button
					key={option.value}
					className={cn(
						'relative flex size-7 cursor-pointer items-center justify-center rounded-sm transition-all duration-200',
						theme === option.value
							? 'text-foreground'
							: 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
					)}
					role="radio"
					aria-checked={theme === option.value}
					aria-label={`Switch to ${option.value} theme`}
					onClick={() => setTheme(option.value)}
				>
					{theme === option.value && (
						<motion.div
							layoutId="theme-option"
							transition={{ type: 'spring', bounce: 0.1, duration: 0.6 }}
							className="absolute inset-0 rounded-sm bg-background shadow-sm border border-border/20 z-0"
						/>
					)}
					<option.icon className="size-3.5 z-10" />
				</button>
			))}
		</motion.div>
	);
}
