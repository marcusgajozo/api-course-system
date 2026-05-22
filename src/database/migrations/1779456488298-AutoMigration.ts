import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoMigration1779456488298 implements MigrationInterface {
  name = 'AutoMigration1779456488298';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "turmas" DROP CONSTRAINT "FK_24ee7ddcb692f9357e554686acb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "turmas" ADD CONSTRAINT "FK_24ee7ddcb692f9357e554686acb" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "turmas" DROP CONSTRAINT "FK_24ee7ddcb692f9357e554686acb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "turmas" ADD CONSTRAINT "FK_24ee7ddcb692f9357e554686acb" FOREIGN KEY ("curso_id") REFERENCES "cursos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
