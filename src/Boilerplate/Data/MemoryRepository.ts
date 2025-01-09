/**
 * Simple helper class that mimics database access.
 */
export class MemoryRepository<T extends { id?: string }> {

    // //////////////////////////////
    // THERE IS NOTHING TO DO IN HERE
    // //////////////////////////////



    protected idCounter = 0;
    protected items: Map<string, T> = new Map<string, T>();

    async findAll(): Promise<T[]> {
        return Array.from(this.items.values());
    }

    async findById(id: string): Promise<T> {
        return this.items.get(id);
    }


    async findByIds(ids: string[]): Promise<T[]> {
        return Promise.all(ids.map(id => this.findById(id)).filter(i => !!i));
    }


    async create(item: T): Promise<T> {
        if (!item.id) {
            item.id = (++this.idCounter).toString();
        }
        this.items.set(item.id, item);
        return item;
    }


    async update(item: T) {
        this.items.set(item.id, item);
        return item;
    }


    async updateMany(items: T[]) {
        for (const item of items) {
            this.items.set(item.id, item);
        }

        return items.length;
    }

    async delete(itemId: string) {
        return this.items.delete(itemId);
    }

}

