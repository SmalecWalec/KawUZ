import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8081/api/product';

function ProductForm({ initialProduct = {}, onProductSaved }) {
    const [productData, setProductData] = useState({
        name: initialProduct.name || '',
        description: initialProduct.description || '',
        price: initialProduct.price || 0,
        stockQuantity: initialProduct.stockQuantity || 0,
    });

    const isEditMode = initialProduct.id != null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProductData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let response;
            if (isEditMode) {
                response = await axios.put(`${API_URL}/${initialProduct.id}`, productData);
                console.log('Produkt zaktualizowany:', response.data);
            } else {
                response = await axios.post(API_URL, productData);
                console.log('Produkt utworzony:', response.data);
            }

            setProductData({ name: '', description: '', price: 0, stock: 0 });
            if (onProductSaved) {
                onProductSaved();
            }

        } catch (error) {
            console.error('Błąd zapisu produktu:', error);
            alert('Wystąpił błąd podczas zapisywania produktu.');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '20px' }}>
            <h2>{isEditMode ? 'Edytuj Produkt' : 'Dodaj Nowy Produkt'}</h2>

            <div>
                <label>Nazwa:</label>
                <input type="text" name="name" value={productData.name} onChange={handleChange} required />
            </div>

            <div>
                <label>Opis:</label>
                <textarea name="description" value={productData.description} onChange={handleChange}></textarea>
            </div>

            <div>
                <label>Cena:</label>
                <input type="number" name="price" value={productData.price} onChange={handleChange} required min="0" step="0.01" />
            </div>

            <div>
                <label>Ilość na magazynie:</label>
                <input
                    type="number"
                    name="stockQuantity"
                    value={productData.stockQuantity}
                    onChange={handleChange}
                    required min="0"
                />            </div>

            <button type="submit">
                {isEditMode ? 'Zapisz Zmiany' : 'Dodaj Produkt'}
            </button>
        </form>
    );
}

export default ProductForm;