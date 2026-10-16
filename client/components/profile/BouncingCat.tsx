import { motion } from "framer-motion";

export default function BouncingCat() {
	return (
		<div className="flex justify-center">
			<motion.img
				src="/wawa_cat.webp"
				alt="Chubby cat"
				className="w-[360px] h-[360px] object-contain drop-shadow-2xl select-none cursor-pointer"
				whileTap={{
					scale: 0.85,
					rotate: -5,
					transition: { duration: 0.15 },
				}}
				whileHover={{ scale: 1.05 }}
			/>
		</div>
	);
}