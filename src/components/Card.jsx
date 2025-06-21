import styles from './card.module.css';
export const Card = ({img, title, description, link}) => {

    return <a href={link} className={styles.card}>
        <img src={img} />
        <h3>{title}</h3>
        <p>{description}</p>
    </a>
}
