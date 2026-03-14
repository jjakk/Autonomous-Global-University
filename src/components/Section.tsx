interface SectionProps {
    title?: string;
    centerTitle?: boolean;
    subtitle?: string;
    children?: React.ReactNode;
    className?: string;
}

export default function Section(props: SectionProps) {
    return (
        <div className={"bg-white p-5 border-1 border-gray-300 rounded-lg " + props.className}>
            {props.title && <h1 className={`m-4 ${props.centerTitle ? "text-center" : ""}`}>{props.title}</h1>}
            {props.subtitle && <span className={`m-4 text-lg ${props.centerTitle ? "text-center" : ""} text-gray-600`}>{props.subtitle}</span>}
            {props.children}
        </div>
    );
};