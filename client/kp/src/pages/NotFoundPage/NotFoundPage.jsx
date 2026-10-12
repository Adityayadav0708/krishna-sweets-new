import { ArrowLeft } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button/Button';
import styles from './NotFoundPage.module.css';
export function NotFoundPage() {
    return (<main className={styles.page}>
      <span>404</span>
      <h1>This box is empty.</h1>
      <p>The sweet you were looking for may have moved—or been enjoyed already.</p>
      <ButtonLink to="/"><ArrowLeft size={17}/> Return home</ButtonLink>
    </main>);
}
