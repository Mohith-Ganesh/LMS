const { Sequelize, DataTypes } = require('sequelize');
const { SELECT } = require('sequelize/lib/query-types');

// ivi add chey ikkada 
// username adagaledu nannu em pettali
const sequelize = new Sequelize('LMS', 'postgres', 'Mohith@07Ganesh', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false,
});

const Users = sequelize.define('Users', {
    username: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: true,

    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone_no: {
        type: DataTypes.STRING,
        allowNull: true

    },
    approval: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'Users',
    timestamps: false,
});


const Books = sequelize.define('Books', {
    bookId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Auto-generate UUID v4
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    author: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    genre: {
        type: DataTypes.STRING,
        allowNull: true
    },
    imagelink: {
        type: DataTypes.STRING,
        allowNull: true

    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    count: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

const BookReviews = sequelize.define('BookReviews', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Users,
            key: 'username'
        },
        primaryKey: true
    },
    bookId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Books,
            key: 'bookId'
        },
        primaryKey: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: true
    }
}, {
    tableName: 'BookReviews',
    timestamps: false
});


const BookIssues = sequelize.define('BookIssues', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Users,
            key: 'username'
        },
        primaryKey: true
    },
    bookId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Books,
            key: 'bookId'
        },
        primaryKey: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: true
    }
},
    {
        tableName: 'BookIssues',
        timestamps: false

    }
)

const ProfessorRecommendations = sequelize.define('ProfessorRecommendations', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Users,
            key: 'username'
        },
        primaryKey: true
    },
    bookId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Books,
            key: 'bookId'
        },
        primaryKey: true
    }
},
    {
        tableName: 'ProfessorRecommendations',
        timestamps: false

    })



sequelize.sync()
    .then(() => {
        console.log('All models synchronized successfully.');
    })
    .catch((error) => {
        console.error('Error synchronizing models:', error);
    });
module.exports = { Users, Books, sequelize, BookReviews, BookIssues, ProfessorRecommendations };

