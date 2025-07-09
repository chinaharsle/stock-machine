// Sample machine data
export const machinesData = [
    {
        id: 1,
        model: "MasterBend 11025",
        stock: 3,
        productionDate: "June 2025",
        images: [
            "https://images.unsplash.com/photo-1581092918484-8313ada2d32a?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1581092918482-d8b6b7b1c568?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop"
        ],
        specifications: {
            bendingTonnage: "110 Tons",
            bendingLength: "2500 mm",
            operatingSystem: "DA-66T CNC System",
            backgaugeAxis: "X+R+Z1+Z2"
        },
        toolingDrawing: "https://www.example.com/tooling/masterbend-11025.pdf"
    },
    {
        id: 2,
        model: "PowerPress 16030",
        stock: 2,
        productionDate: "May 2025",
        images: [
            "https://images.unsplash.com/photo-1565087681768-14d5d4a84574?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1581092917954-4eb1f65ed5de?w=600&h=400&fit=crop"
        ],
        specifications: {
            bendingTonnage: "160 Tons",
            bendingLength: "3000 mm",
            operatingSystem: "Estun E21 CNC System",
            backgaugeAxis: "X+R+Z1+Z2+V"
        },
        toolingDrawing: "https://www.example.com/tooling/powerpress-16030.pdf"
    },
    {
        id: 3,
        model: "FlexiBend 8025",
        stock: 5,
        productionDate: "July 2025",
        images: [
            "https://images.unsplash.com/photo-1581092917909-35b8bb9e9e80?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1565087681767-bb3c7b4eb26f?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1581092917849-d8b6b7b1c567?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1559827260-dc66d52bef18?w=600&h=400&fit=crop"
        ],
        specifications: {
            bendingTonnage: "80 Tons",
            bendingLength: "2500 mm",
            operatingSystem: "Delem DA-58T CNC System",
            backgaugeAxis: "X+R+Z1+Z2"
        },
        toolingDrawing: "https://www.example.com/tooling/flexibend-8025.pdf"
    },
    {
        id: 4,
        model: "PrecisionBend 20040",
        stock: 1,
        productionDate: "April 2025",
        images: [
            "https://images.unsplash.com/photo-1581092334651-ddf26d9a09d8?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1565087681768-f4eb1f65ed5c?w=600&h=400&fit=crop"
        ],
        specifications: {
            bendingTonnage: "200 Tons",
            bendingLength: "4000 mm",
            operatingSystem: "Cybelec DNC-880S CNC System",
            backgaugeAxis: "X+R+Z1+Z2+V+W"
        },
        toolingDrawing: "https://www.example.com/tooling/precisionbend-20040.pdf"
    },
    {
        id: 5,
        model: "HeavyDuty 30050",
        stock: 4,
        productionDate: "March 2025",
        images: [
            "https://images.unsplash.com/photo-1581092917963-4eb1f65ed5df?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1565087681767-bb3c7b4eb26e?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1581092917877-d8b6b7b1c569?w=600&h=400&fit=crop"
        ],
        specifications: {
            bendingTonnage: "300 Tons",
            bendingLength: "5000 mm",
            operatingSystem: "ESA S630 CNC System",
            backgaugeAxis: "X+R+Z1+Z2+V+W+B"
        },
        toolingDrawing: "https://www.example.com/tooling/heavyduty-30050.pdf"
    },
    {
        id: 6,
        model: "CompactBend 6020",
        stock: 8,
        productionDate: "August 2025",
        images: [
            "https://images.unsplash.com/photo-1581092917838-d8b6b7b1c566?w=600&h=400&fit=crop"
        ],
        specifications: {
            bendingTonnage: "60 Tons",
            bendingLength: "2000 mm",
            operatingSystem: "Delem DA-53T CNC System",
            backgaugeAxis: "X+R+Z1+Z2"
        },
        toolingDrawing: "https://www.example.com/tooling/compactbend-6020.pdf"
    },
    {
        id: 7,
        model: "IndustrialMax 25060",
        stock: 2,
        productionDate: "February 2025",
        images: [
            "https://images.unsplash.com/photo-1581092917952-4eb1f65ed5dd?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1565087681767-bb3c7b4eb26d?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1581092917866-d8b6b7b1c568?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1559827260-dc66d52bef17?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1581092917945-4eb1f65ed5dc?w=600&h=400&fit=crop"
        ],
        specifications: {
            bendingTonnage: "250 Tons",
            bendingLength: "6000 mm",
            operatingSystem: "Estun E300P CNC System",
            backgaugeAxis: "X+R+Z1+Z2+V+W+B+T"
        },
        toolingDrawing: "https://www.example.com/tooling/industrialmax-25060.pdf"
    }
];

// Utility functions
export const formatSpecificationLabel = (key) => {
    const labelMap = {
        bendingTonnage: "Bending Tonnage",
        bendingLength: "Bending Length",
        operatingSystem: "Operating System",
        backgaugeAxis: "Backgauge Axis"
    };
    return labelMap[key] || key;
}; 