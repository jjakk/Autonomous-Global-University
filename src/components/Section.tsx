interface SectionProps {
    title?: string;
    centerTitle?: boolean;
    children?: React.ReactNode;
    className?: string;
}

export default function Section(props: SectionProps) {
    return (
        <div className={"bg-white p-5 border-1 border-gray-300 rounded-lg " + props.className}>
            {props.title && <h1 className={`m-2 ${props.centerTitle ? "text-center" : ""}`}>{props.title}</h1>}
            {props.children}
        </div>
    );
};