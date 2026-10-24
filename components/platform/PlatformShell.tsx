import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./PlatformShell.module.css";

export function PlatformShell({title,eyebrow,description,children}:{title:string;eyebrow:string;description:string;children:ReactNode}){
  return <div className={styles.page}><header className={styles.header}><Link className={styles.brand} href="/"><i>SR</i>SafeRoute 2.0</Link><nav className={styles.nav} aria-label="Platform navigation"><Link href="/dashboard">Dashboard</Link><Link href="/report">Report</Link><Link href="/emergency">Emergency</Link><Link href="/my-routes">My routes</Link><Link href="/notifications">Notifications</Link><Link href="/settings">Settings</Link></nav></header><main className={styles.main}><section className={styles.intro}><span className={styles.eyebrow}>{eyebrow}</span><h1>{title}</h1><p>{description}</p></section>{children}</main></div>;
}

export {styles as platformStyles};
