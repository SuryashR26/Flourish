import React, { ButtonHTMLAttributes } from 'react';

type ButtonStyle = 'primary' | 'outline';
type ButtonSize = 'medium' | 'large';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    buttonStyle?: ButtonStyle;
    buttonSize?: ButtonSize;
    className?: string;
}

const styleClasses = {
    primary:
        'bg-white text-gray-900 relative overflow-hidden font-semibold text-lg border-2 border-white rounded-[12px] transition-colors duration-250 hover:text-white hover:bg-[#0C121C]',
    outline:
        'bg-transparent text-white border-2 border-white rounded-[12px] font-semibold text-lg hover:bg-white hover:text-gray-900 transition-colors duration-250',
};

const sizeClasses = {
    medium: 'py-2.5 px-6 text-base',
    large: 'py-3.5 px-7 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
    children,
    buttonStyle = 'primary',
    buttonSize = 'medium',
    className = '',
    ...rest
}) => {
    const baseClasses = 'cursor-pointer relative z-10';

    return (
        <button
            className={`${baseClasses} ${styleClasses[buttonStyle]} ${sizeClasses[buttonSize]} ${className}`}
            {...rest}
        >
            {children}
            {/* Background effect similar to ::after using an absolute div */}
            <span
                aria-hidden="true"
                className={`absolute top-[-2px] left-[-120%] w-[calc(100%+8px)] h-[calc(100%+8px)] rounded-[12px] bg-white transition-left duration-250 ease-in-out pointer-events-none ${buttonStyle === 'primary' ? 'bg-[#0C121C] left-[-102%]' : ''
                    } group-hover:left-[-2px]`}
                style={{ zIndex: -1 }}
            />
        </button>
    );
};