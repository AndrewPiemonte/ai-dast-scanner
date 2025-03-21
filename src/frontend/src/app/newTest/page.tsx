"use client";
import styles from "../page.module.css";
import { NewTestCard } from "./card";

export default function Home() {
	return (
		<div className={styles.background2}>
					<div className="flex w-full h-full flex-col flex items-center justify-center">
						<NewTestCard />
					</div>
		</div>
	);
}
