import React, { useEffect, useState } from 'react';
import './Menu.css';
import AddFoodModal from '../../components/AddFoodModal';
import EditFoodModal from '../../components/EditFoodModal';
import Sidebar from '../../components/Sidebar';
import Swal from 'sweetalert2';
import { FaBell, FaFilter, FaPen, FaTrash } from 'react-icons/fa';
import axiosClient from '../../axiosClient';

function Menu() {
    const user = JSON.parse(localStorage.getItem('user'));
    const [showModal, setShowModal] = React.useState(false);
    const [showEditModal, setShowEditModal] = React.useState(false);
    const [menuData, setMenuData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFood, setSelectedFood] = useState(null);

    useEffect(() => {
        fetchFoods();
    }, []);

    const fetchFoods = () => {
        axiosClient.get('/foods')
            .then(res => {
                const foods = res.data.foods;

                const grouped = foods.reduce((acc, food) => {
                    const category = food.food_type;
                    if (!acc[category]) acc[category] = [];
                    acc[category].push({
                    name: food.food_name,
                    description: food.food_description,
                    id: food.food_id
                    });
                    return acc;
                }, {});

                const formatted = Object.entries(grouped).map(([category, items]) => ({
                    category,
                    items
                }));

                setMenuData(formatted);
            })
            .catch(err => {
                console.error('Failed to load foods:', err.response?.data || err.message);
                Swal.fire('Error', 'Could not load menu.', 'error');
            });
    };

    const filteredMenuData = menuData
    .map(category => ({
        ...category,
        items: category.items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }))
    .filter(category => category.items.length > 0);

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="main-content">
                <header className="topbar">
                    <div className="topbar-left"></div>
                    <div className="topbar-right">
                        <span className="user-name">
                            {user ? `${user.first_name} ${user.last_name}` : 'Guest'}
                        </span>
                        <FaBell className="notif-icon" />
                    </div>
                </header>

                <section className="staff-header">
                    <h3>Menu</h3>
                    <div className="staff-header-actions">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="🔍 Search food by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="spacer" />
                        <div className="button-group">
                            <button className="add-btn" onClick={() => setShowModal(true)}>+ Add New Food</button>
                        </div>
                    </div>
                </section>

                <section className="dashboard-bottom">
                    <div className="menu-categories">
                        {filteredMenuData.map(cat => (
                            <div key={cat.category} className="menu-category-block">
                                <h3 className="category-title">{cat.category}</h3>
                                <div className="menu-grid">
                                    {cat.items.map(item => (
                                        <div key={item.name} className="menu-card"
                                            onClick={() => {
                                                setSelectedFood({
                                                    food_name: item.name,
                                                    food_description: item.description,
                                                    food_type: cat.category,
                                                    food_id: item.id
                                                });
                                                setShowEditModal(true);
                                            }}>
                                            <div className="menu-card-content">
                                                <span className="menu-name">{item.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
            <AddFoodModal
            show={showModal}
            onClose={() => setShowModal(false)}
            onSave={fetchFoods}
            />
            <EditFoodModal
            show={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSave={fetchFoods}
            food={selectedFood}
            />
        </div>
    );
}

export default Menu;