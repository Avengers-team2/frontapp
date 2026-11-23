type FormSectionProps = {
    id: string;
    title: string;
    required?: boolean;
    hint?: string;
    description?: string;
    children: React.ReactNode;
};

export default function FormSection({ id, title, required, hint, description, children }: FormSectionProps) {
    return (
        <section id={id} className="scroll-mt-32 border-b border-line py-[52px] last:border-b-0">
            <h2 className="flex items-baseline gap-2 text-[36px] font-bold text-ink-900">
                {title}
                {required && <span className="text-danger">*</span>}
                {hint && <span className="text-[15px] font-normal text-ink-300">{hint}</span>}
            </h2>
            {description && <p className="mt-3 text-[17px] text-ink-400">{description}</p>}
            <div className="mt-10">{children}</div>
        </section>
    );
}
