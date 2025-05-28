import { HTMLAttributes, forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'onDrag'> {
  variant?: 'default' | 'outline' | 'elevated';
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className = '',
      variant = 'default',
      hoverable = false,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-lg transition-all duration-200';

    const variantStyles = {
      default: 'bg-card text-card-foreground shadow-sm',
      outline: 'border border-border bg-card',
      elevated: 'bg-card shadow-md hover:shadow-lg',
    };

    const hoverStyles = hoverable
      ? 'hover:shadow-lg hover:-translate-y-0.5'
      : '';

    return (
      <motion.div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}
        whileHover={hoverable ? { y: -2 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const CardHeader = ({
  className = '',
  title,
  description,
  action,
  children,
  ...props
}: CardHeaderProps) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
    <div className="flex items-center justify-between">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      {action}
    </div>
    {description && (
      <p className="text-sm text-muted-foreground">{description}</p>
    )}
    {children}
  </div>
);

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = ({
  className = '',
  children,
  ...props
}: CardContentProps) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

export const CardFooter = ({
  className = '',
  justify = 'start',
  children,
  ...props
}: CardFooterProps) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  return (
    <div
      className={`flex items-center ${justifyClasses[justify]} p-6 pt-0 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className = '', ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-lg font-semibold leading-none tracking-tight ${className}`}
      {...props}
    />
  )
);

CardTitle.displayName = 'CardTitle';
