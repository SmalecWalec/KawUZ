export const debounce = (func, delay) => {
    let timeoutId;
    return function(...args) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

export const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};

export const getProductImage = (productName) => {
    const encodedName = encodeURIComponent(productName);
    const imageUrl = `/images/${encodedName}.png`;
    const mockImageUrl = "https://via.placeholder.com/80x80?text=Kawa";
    return imageUrl || mockImageUrl;
};