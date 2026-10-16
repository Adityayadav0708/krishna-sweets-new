// This component is a simple box that keeps content in the center of the page.
// It also stops content from becoming too wide on big screens.

import styles from './Container.module.css';

// children  = anything written between <Container> and </Container>
// className = extra CSS class if needed (optional)
// ...props  = any other normal HTML tag properties
export function Container({ children, className = '', ...props }) {
  return (
    // This div applies the centering CSS + any extra class passed in
    <div className={`${styles.container} ${className}`} {...props}>
      {children} {/* shows whatever is inside this component */}
    </div>
  );
}

