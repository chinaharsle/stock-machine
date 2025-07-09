-- 为 machines 表添加排序字段
ALTER TABLE machines ADD COLUMN sort_order INTEGER DEFAULT 0;

-- 为现有记录设置默认排序（按创建时间排序）
UPDATE machines 
SET sort_order = (
    SELECT ROW_NUMBER() OVER (ORDER BY created_at)
    FROM (SELECT id, created_at FROM machines ORDER BY created_at) as ordered_machines
    WHERE ordered_machines.id = machines.id
);

-- 添加索引以提高排序查询性能
CREATE INDEX idx_machines_sort_order ON machines(sort_order);

-- 创建函数来重新排序机器
CREATE OR REPLACE FUNCTION reorder_machines(machine_ids uuid[])
RETURNS void AS $$
DECLARE
    i integer;
BEGIN
    -- 更新每个机器的排序顺序
    FOR i IN 1..array_length(machine_ids, 1) LOOP
        UPDATE machines 
        SET sort_order = i 
        WHERE id = machine_ids[i];
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建函数来移动机器位置
CREATE OR REPLACE FUNCTION move_machine_position(
    machine_id uuid,
    direction text -- 'up' or 'down'
)
RETURNS boolean AS $$
DECLARE
    current_order integer;
    target_order integer;
    swap_machine_id uuid;
BEGIN
    -- 获取当前机器的排序位置
    SELECT sort_order INTO current_order 
    FROM machines 
    WHERE id = machine_id;
    
    IF current_order IS NULL THEN
        RETURN false;
    END IF;
    
    -- 确定目标位置
    IF direction = 'up' THEN
        target_order = current_order - 1;
    ELSIF direction = 'down' THEN
        target_order = current_order + 1;
    ELSE
        RETURN false;
    END IF;
    
    -- 查找目标位置的机器
    SELECT id INTO swap_machine_id 
    FROM machines 
    WHERE sort_order = target_order
    LIMIT 1;
    
    IF swap_machine_id IS NULL THEN
        RETURN false;
    END IF;
    
    -- 交换两个机器的位置
    UPDATE machines SET sort_order = current_order WHERE id = swap_machine_id;
    UPDATE machines SET sort_order = target_order WHERE id = machine_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 