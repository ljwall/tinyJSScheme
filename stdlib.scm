(define nill?
  (lambda (lst) (== lst '())))

(define filter
  (lambda (predFn lst)
    (if (nill? lst)
      '()
      (if (predFn (head lst))
        (cons (head lst) (filter predFn (tail lst)))
        (filter predFn (tail lst))))))

(define map
  (lambda (fn lst)
    (if (nill? lst)
      '()
      (cons (fn (head lst)) (map fn (tail lst))))))

(define fibG
  (lambda (a b n)
    (if (<= n 0)
      '()
      (cons (+ a b) (fibG b (+ a b) (- n 1))))))

(define fib
  (lambda (n)
    (cons 1 (cons 1 (fibG 1 1 (- n 2))))))


